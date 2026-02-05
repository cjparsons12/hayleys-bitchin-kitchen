import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import recipesRouter from './routes/recipes.js';
import adminRouter from './routes/admin.js';
import logger from './services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
  app.use(express.static(join(__dirname, '../dist')));
  
  // Serve index.html for all other routes (SPA)
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
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
