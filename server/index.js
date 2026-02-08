import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import recipesRouter from './routes/recipes.js';
import adminRouter from './routes/admin.js';
import { getRecipeBySlug } from './services/database.js';
import logger from './services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Cache for index.html template (in production mode)
let htmlTemplate = null;

// Helper function to generate Open Graph meta tags
const generateMetaTags = (recipe = null) => {
  const domain = process.env.DOMAIN || 'localhost';
  const protocol = domain === 'localhost' ? 'http' : 'https';
  const baseUrl = `${protocol}://${domain}`;
  
  if (recipe) {
    // Recipe-specific meta tags
    const title = recipe.title || `${recipe.site_name} Recipe`;
    const description = recipe.description || `View this delicious recipe from ${recipe.site_name}`;
    const imageUrl = recipe.image_url || 'https://placehold.co/1200x630/FF6B6B/FFFFFF?text=Recipe&font=quicksand';
    const url = `${baseUrl}/recipe/${recipe.slug}`;
    
    return `
    <title>${title} - Hayley's Bitchin Kitchen</title>
    <meta name="description" content="${escapeHtml(description)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:site_name" content="Hayley's Bitchin Kitchen" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />`;
  } else {
    // Default site-wide meta tags
    const title = "Hayley's Bitchin Kitchen";
    const description = "A collection of delicious recipes worth sharing. Discover amazing recipes from around the web.";
    const imageUrl = 'https://placehold.co/1200x630/FF6B6B/FFFFFF?text=Hayley%27s+Bitchin+Kitchen&font=quicksand';
    
    return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:site_name" content="${title}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${baseUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />`;
  }
};

// Helper function to escape HTML in meta tag content
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting for public endpoints
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_PUBLIC) || 60,
  message: { error: 'Too many requests', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_ADMIN) || 10,
  message: { error: 'Too many requests', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMIT' });
  }
});

// API Routes
app.use('/api/recipes', publicLimiter, recipesRouter);
app.use('/api/admin', adminLimiter, adminRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Load and cache index.html template
  const indexPath = join(__dirname, '../dist/index.html');
  if (existsSync(indexPath)) {
    htmlTemplate = readFileSync(indexPath, 'utf-8');
    logger.info('Cached index.html template for meta tag injection');
  }
  
  app.use(express.static(join(__dirname, '../dist')));
  
  // Serve index.html with dynamic meta tags for all other routes (SPA)
  app.get('*', async (req, res) => {
    try {
      // Check if this is a recipe detail route
      const recipeMatch = req.path.match(/^\/recipe\/([a-z0-9-]+)$/);
      
      if (recipeMatch && htmlTemplate) {
        const slug = recipeMatch[1];
        
        // Fetch recipe from database
        const recipe = getRecipeBySlug(slug);
        
        // Generate appropriate meta tags
        const metaTags = generateMetaTags(recipe);
        
        // Inject meta tags into HTML template
        // Replace the existing <title> tag and insert meta tags before </head>
        let html = htmlTemplate;
        
        // Remove existing title tag
        html = html.replace(/<title>.*?<\/title>/, '');
        
        // Inject new meta tags before </head>
        html = html.replace('</head>', `${metaTags}\n  </head>`);
        
        // Send modified HTML
        res.send(html);
        
        if (recipe) {
          logger.debug('Served recipe with OG tags', { slug, title: recipe.title });
        }
      } else {
        // Not a recipe route or no cached template - serve file normally
        res.sendFile(join(__dirname, '../dist/index.html'));
      }
    } catch (error) {
      logger.error('Error serving HTML with meta tags', { 
        error: error.message, 
        path: req.path 
      });
      // Fallback to serving file normally
      res.sendFile(join(__dirname, '../dist/index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path 
  });
  res.status(500).json({ 
    error: 'Internal server error', 
    code: 'SERVER_ERROR' 
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
    cors: process.env.CORS_ORIGIN || '*'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
