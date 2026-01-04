#!/usr/bin/env python3

"""
Seeder script to populate the database with sample recipes.
"""

from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal
from models import Recipe, RecipeImage

# Sample recipes data
sample_recipes = [
    {
        "title": "Classic Spaghetti Carbonara",
        "description": "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
        "link": "https://www.allrecipes.com/recipe/23806/spaghetti-carbonara-ii/",
        "image": "spaghetti-carbonara-main.jpg"
    },
    {
        "title": "Chicken Tikka Masala",
        "description": "Creamy and spicy Indian curry with tender chicken pieces in a rich tomato-based sauce.",
        "link": "https://www.bbcgoodfood.com/recipes/chicken-tikka-masala",
        "image": "chicken-tikka-masala-main.jpg"
    },
    {
        "title": "Homemade Chocolate Chip Cookies",
        "description": "Soft and chewy cookies loaded with chocolate chips. Perfect for dessert or snacking.",
        "image": "chocolate-chip-cookies-main.jpg"
    },
    {
        "title": "Mediterranean Quinoa Bowl",
        "description": "Healthy bowl with quinoa, cherry tomatoes, cucumber, feta cheese, and olive oil dressing.",
        "link": "https://www.eatingwell.com/recipe/249807/mediterranean-quinoa-bowl/",
        "image": "mediterranean-quinoa-main.jpg"
    },
    {
        "title": "Beef Stroganoff",
        "description": "Tender beef strips in a creamy mushroom sauce served over egg noodles.",
        "image": "beef-stroganoff-main.jpg"
    },
    {
        "title": "Vegetable Stir-Fry",
        "description": "Colorful mix of fresh vegetables stir-fried with garlic, ginger, and soy sauce.",
        "link": "https://www.foodnetwork.com/recipes/food-network-kitchen/vegetable-stir-fry-recipe-2108872",
        "image": "vegetable-stir-fry-main.jpg"
    },
    {
        "title": "Banana Bread",
        "description": "Moist and flavorful quick bread made with ripe bananas, perfect for breakfast or snacks.",
        "image": "banana-bread-main.jpg"
    },
    {
        "title": "Shakshuka",
        "description": "Middle Eastern dish of eggs poached in a sauce of tomatoes, peppers, onions, and spices.",
        "link": "https://www.seriouseats.com/recipes/2012/04/shakshuka-north-african-shirred-eggs.html",
        "image": "shakshuka-main.jpg"
    },
    {
        "title": "Caesar Salad",
        "description": "Crisp romaine lettuce with parmesan cheese, croutons, and creamy Caesar dressing.",
        "image": "caesar-salad-main.jpg"
    },
    {
        "title": "Blueberry Pancakes",
        "description": "Fluffy pancakes studded with fresh blueberries, served with maple syrup.",
        "link": "https://www.kingarthurflour.com/recipes/blueberry-pancakes-recipe",
        "image": "blueberry-pancakes-main.jpg"
    }
]

# Sample additional images for recipes (by index in sample_recipes)
sample_additional_images = [
    # Spaghetti Carbonara (index 0) - multiple cooking steps
    {"recipe_index": 0, "images": ["carbonara-ingredients.jpg", "carbonara-cooking.jpg", "carbonara-finished.jpg"]},
    # Chicken Tikka Masala (index 1) - marinating and cooking
    {"recipe_index": 1, "images": ["tikka-marinating.jpg", "tikka-cooking.jpg"]},
    # Chocolate Chip Cookies (index 2) - dough and baking
    {"recipe_index": 2, "images": ["cookie-dough.jpg", "cookies-baking.jpg", "cookies-cooling.jpg"]},
    # Mediterranean Quinoa Bowl (index 3) - ingredients and assembly
    {"recipe_index": 3, "images": ["quinoa-ingredients.jpg", "quinoa-assembled.jpg"]},
    # Vegetable Stir-Fry (index 5) - prep and cooking
    {"recipe_index": 5, "images": ["stir-fry-veggies.jpg", "stir-fry-cooking.jpg"]},
    # Shakshuka (index 7) - cooking process
    {"recipe_index": 7, "images": ["shakshuka-sauce.jpg", "shakshuka-eggs.jpg"]},
]

def seed_database(force_reseed=False):
    """Seed the database with sample recipes and images."""
    # Create a new session
    db = SessionLocal()

    try:
        # Check if recipes already exist
        existing_count = db.query(Recipe).count()
        if existing_count >= 10 and not force_reseed:
            print(f"Database already has {existing_count} recipes. Skipping seeding.")
            print("Use force_reseed=True to reseed the database.")
            return

        if force_reseed:
            print("Force reseeding - clearing existing data...")
            # Delete all existing data
            db.query(RecipeImage).delete()
            db.query(Recipe).delete()
            db.commit()

        # Create recipe objects
        recipes_to_add = []
        for recipe_data in sample_recipes:
            recipe = Recipe(**recipe_data)
            recipes_to_add.append(recipe)

        # Add all recipes to the session
        db.add_all(recipes_to_add)
        db.commit()  # Commit to get IDs

        # Refresh to get the IDs
        for recipe in recipes_to_add:
            db.refresh(recipe)

        # Create additional images
        images_to_add = []
        for additional_data in sample_additional_images:
            recipe_index = additional_data["recipe_index"]
            if recipe_index < len(recipes_to_add):
                recipe = recipes_to_add[recipe_index]
                for image_filename in additional_data["images"]:
                    image = RecipeImage(
                        recipe_id=recipe.id,
                        image_filename=image_filename
                    )
                    images_to_add.append(image)

        # Add all additional images
        if images_to_add:
            db.add_all(images_to_add)
            db.commit()

        print(f"Successfully seeded database with {len(recipes_to_add)} recipes and {len(images_to_add)} additional images!")

        # Verify the seeding
        total_recipes = db.query(Recipe).count()
        total_images = db.query(RecipeImage).count()
        print(f"Total recipes in database: {total_recipes}")
        print(f"Total additional images in database: {total_images}")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    force_reseed = len(sys.argv) > 1 and sys.argv[1] == "--force"
    seed_database(force_reseed=force_reseed)