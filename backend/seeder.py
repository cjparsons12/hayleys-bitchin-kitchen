#!/usr/bin/env python3

"""
Seeder script to populate the database with sample recipes.
"""

from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal
from models import Recipe

# Sample recipes data
sample_recipes = [
    {
        "title": "Classic Spaghetti Carbonara",
        "description": "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
        "link": "https://www.allrecipes.com/recipe/23806/spaghetti-carbonara-ii/"
    },
    {
        "title": "Chicken Tikka Masala",
        "description": "Creamy and spicy Indian curry with tender chicken pieces in a rich tomato-based sauce.",
        "link": "https://www.bbcgoodfood.com/recipes/chicken-tikka-masala"
    },
    {
        "title": "Homemade Chocolate Chip Cookies",
        "description": "Soft and chewy cookies loaded with chocolate chips. Perfect for dessert or snacking."
    },
    {
        "title": "Mediterranean Quinoa Bowl",
        "description": "Healthy bowl with quinoa, cherry tomatoes, cucumber, feta cheese, and olive oil dressing.",
        "link": "https://www.eatingwell.com/recipe/249807/mediterranean-quinoa-bowl/"
    },
    {
        "title": "Beef Stroganoff",
        "description": "Tender beef strips in a creamy mushroom sauce served over egg noodles."
    },
    {
        "title": "Vegetable Stir-Fry",
        "description": "Colorful mix of fresh vegetables stir-fried with garlic, ginger, and soy sauce.",
        "link": "https://www.foodnetwork.com/recipes/food-network-kitchen/vegetable-stir-fry-recipe-2108872"
    },
    {
        "title": "Banana Bread",
        "description": "Moist and flavorful quick bread made with ripe bananas, perfect for breakfast or snacks."
    },
    {
        "title": "Shakshuka",
        "description": "Middle Eastern dish of eggs poached in a sauce of tomatoes, peppers, onions, and spices.",
        "link": "https://www.seriouseats.com/recipes/2012/04/shakshuka-north-african-shirred-eggs.html"
    },
    {
        "title": "Caesar Salad",
        "description": "Crisp romaine lettuce with parmesan cheese, croutons, and creamy Caesar dressing."
    },
    {
        "title": "Blueberry Pancakes",
        "description": "Fluffy pancakes studded with fresh blueberries, served with maple syrup.",
        "link": "https://www.kingarthurflour.com/recipes/blueberry-pancakes-recipe"
    }
]

def seed_database():
    """Seed the database with sample recipes."""
    # Create a new session
    db = SessionLocal()

    try:
        # Check if recipes already exist
        existing_count = db.query(Recipe).count()
        if existing_count >= 10:
            print(f"Database already has {existing_count} recipes. Skipping seeding.")
            return

        # Create recipe objects
        recipes_to_add = []
        for recipe_data in sample_recipes:
            recipe = Recipe(**recipe_data)
            recipes_to_add.append(recipe)

        # Add all recipes to the session
        db.add_all(recipes_to_add)

        # Commit the transaction
        db.commit()

        print(f"Successfully seeded database with {len(recipes_to_add)} recipes!")

        # Verify the seeding
        total_recipes = db.query(Recipe).count()
        print(f"Total recipes in database: {total_recipes}")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()