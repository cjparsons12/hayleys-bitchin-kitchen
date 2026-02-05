import express from 'express';
import { validatePassword, generateToken } from '../services/auth.js';
import { createRecipe, deleteRecipe, getAllRecipes } from '../services/database.js';
import { scrapeRecipeMetadata } from '../services/scraper.js';
import { verifyJWT } from '../middleware/verifyToken.js';
import logger from '../services/logger.js';

const router = express.Router();

// POST /api/admin/auth - Authenticate and get JWT token
router.post('/auth', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        error: 'Password is required', 
        code: 'INVALID_PASSWORD' 
      });
    }
    
    if (!validatePassword(password)) {
      logger.warn('Failed authentication attempt', { ip: req.ip });
      return res.status(401).json({ 
        error: 'Invalid password', 
        code: 'INVALID_PASSWORD' 
      });
    }
    
    const token = generateToken();
    logger.info('Successful authentication', { ip: req.ip });
    
    res.json({ 
      token, 
      expiresIn: '30d' 
    });
    
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    res.status(500).json({ 
      error: 'Authentication failed', 
      code: 'SERVER_ERROR' 
    });
  }
});

// POST /api/admin/recipes - Create new recipe
router.post('/recipes', verifyJWT, async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate URL format
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return res.status(400).json({ 
        error: 'Invalid URL format', 
        code: 'INVALID_URL' 
      });
    }
    
    // Scrape metadata
    const metadata = await scrapeRecipeMetadata(url);
    
    // Save to database
    const recipe = createRecipe(metadata);
    
    logger.info('Recipe created', { 
      id: recipe.id, 
      url, 
      title: recipe.title, 
      ip: req.ip 
    });
    
    res.json(recipe);
    
  } catch (error) {
    logger.error('Failed to create recipe', { error: error.message, url: req.body.url });
    res.status(500).json({ 
      error: 'Failed to scrape recipe', 
      code: 'SCRAPING_FAILED' 
    });
  }
});

// DELETE /api/admin/recipes/:id - Delete recipe
router.delete('/recipes/:id', verifyJWT, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteRecipe(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ 
        error: 'Recipe not found', 
        code: 'NOT_FOUND' 
      });
    }
    
    logger.info('Recipe deleted', { id, ip: req.ip });
    
    res.json({ success: true });
    
  } catch (error) {
    logger.error('Failed to delete recipe', { error: error.message, id: req.params.id });
    res.status(500).json({ 
      error: 'Failed to delete recipe', 
      code: 'SERVER_ERROR' 
    });
  }
});

export default router;
