from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel, model_validator, validator
from typing import List, Optional
from datetime import datetime
import models
from database import engine, get_db
import os
import shutil
import uuid

# Create tables
# models.Base.metadata.create_all(bind=engine)  # Moved to startup event

app = FastAPI(title="Hayley's Bitchin' Kitchen API")

@app.on_event("startup")
async def startup_event():
    models.Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class RecipeImageBase(BaseModel):
    image_filename: str

class RecipeImage(RecipeImageBase):
    id: int
    recipe_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RecipeBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    image: Optional[str] = None  # Optional for existing recipes, required for new ones

    @model_validator(mode='before')
    @classmethod
    def check_title_or_link(cls, values):
        if isinstance(values, dict):
            title = values.get('title')
            link = values.get('link')
            if not title and not link:
                raise ValueError("Either title or link must be provided")
        return values

class RecipeCreate(RecipeBase):
    image: str  # Required for new recipes

class Recipe(RecipeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    additional_images: List[RecipeImage] = []

    class Config:
        from_attributes = True

# Image upload endpoint
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": unique_filename, "url": f"/static/uploads/{unique_filename}"}

# API Endpoints
@app.get("/recipes", response_model=List[Recipe])
def get_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    recipes = db.query(models.Recipe).order_by(models.Recipe.created_at.desc()).offset(skip).limit(limit).all()
    return recipes

@app.post("/recipes", response_model=Recipe)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = models.Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@app.get("/recipes/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@app.put("/recipes/{recipe_id}", response_model=Recipe)
def update_recipe(recipe_id: int, recipe: RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    for key, value in recipe.model_dump().items():
        setattr(db_recipe, key, value)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe deleted"}

# Additional images endpoints
@app.post("/recipes/{recipe_id}/images", response_model=RecipeImage)
async def add_recipe_image(recipe_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Check if recipe exists
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create database entry
    db_image = models.RecipeImage(recipe_id=recipe_id, image_filename=unique_filename)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@app.delete("/recipes/{recipe_id}/images/{image_id}")
def delete_recipe_image(recipe_id: int, image_id: int, db: Session = Depends(get_db)):
    # Check if recipe exists
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Find the image
    db_image = db.query(models.RecipeImage).filter(
        models.RecipeImage.id == image_id,
        models.RecipeImage.recipe_id == recipe_id
    ).first()
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete file from filesystem
    file_path = os.path.join(UPLOAD_DIR, db_image.image_filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from database
    db.delete(db_image)
    db.commit()
    return {"message": "Image deleted"}