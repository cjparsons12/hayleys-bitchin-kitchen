import express from 'express';
import { getAllRecipes, getRecipeBySlug } from '../services/database.js';

const router = express.Router();

// GET /api/recipes - Get all recipes
router.get('/', (req, res) => {
  try {
    const recipes = getAllRecipes();
    res.json({ recipes });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch recipes', 
      code: 'SERVER_ERROR' 
    });
  }
});

// GET /api/recipes/:slug - Get recipe by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const recipe = getRecipeBySlug(slug);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found', 
        code: 'NOT_FOUND' 
      });
    }
    
    res.json({ recipe });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch recipe', 
      code: 'SERVER_ERROR' 
    });
  }
});

export default router;
