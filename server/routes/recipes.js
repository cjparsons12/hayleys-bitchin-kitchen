import express from 'express';
import { getAllRecipes } from '../services/database.js';

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

export default router;
