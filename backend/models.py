from sqlalchemy import Column, Integer, String, Text, DateTime, Index, CheckConstraint, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    image = Column(String(255), nullable=True)  # Main image filename/path, will be required for new recipes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to additional images
    additional_images = relationship("RecipeImage", back_populates="recipe", cascade="all, delete-orphan")

    # Constraint: at least title or link must be provided
    __table_args__ = (
        CheckConstraint("title IS NOT NULL OR link IS NOT NULL", name="title_or_link_required"),
        Index("ix_recipes_created_at", "created_at"),
    )

class RecipeImage(Base):
    __tablename__ = "recipe_images"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    image_filename = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to recipe
    recipe = relationship("Recipe", back_populates="additional_images")

    __table_args__ = (
        Index("ix_recipe_images_recipe_id", "recipe_id"),
    )