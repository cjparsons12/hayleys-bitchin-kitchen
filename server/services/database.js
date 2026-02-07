import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_PATH = process.env.DATABASE_PATH || join(__dirname, '../../data/database.sqlite');

// Ensure data directory exists
const dataDir = dirname(DATABASE_PATH);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  logger.info(`Created data directory: ${dataDir}`);
}

// Initialize database
const db = new Database(DATABASE_PATH);
db.pragma('journal_mode = WAL'); // Better concurrency

logger.info(`Database initialized at: ${DATABASE_PATH}`);

// Create recipes table
db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    site_name TEXT,
    slug TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

logger.info('Database tables initialized');

// Check if slug column exists, add it if not
const checkSlugColumn = () => {
  const columns = db.pragma('table_info(recipes)');
  const hasSlug = columns.some(col => col.name === 'slug');
  
  if (!hasSlug) {
    logger.info('Adding slug column to recipes table');
    // Note: SQLite doesn't support adding UNIQUE columns to existing tables
    // We'll enforce uniqueness in application code instead
    db.exec('ALTER TABLE recipes ADD COLUMN slug TEXT');
    logger.info('Slug column added successfully');
  }
};

// Run column check/migration
checkSlugColumn();

// Utility function to generate URL-friendly slug from title
export const generateSlug = (title) => {
  if (!title) return 'recipe';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Generate unique slug (handles duplicates by appending numbers)
const generateUniqueSlug = (title) => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 2;
  
  // Check if slug exists
  const checkStmt = db.prepare('SELECT id FROM recipes WHERE slug = ?');
  while (checkStmt.get(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Migration: Generate slugs for existing recipes without slugs
const migrateExistingRecipes = () => {
  const recipesWithoutSlug = db.prepare('SELECT id, title FROM recipes WHERE slug IS NULL').all();
  
  if (recipesWithoutSlug.length > 0) {
    logger.info(`Generating slugs for ${recipesWithoutSlug.length} existing recipes`);
    const updateStmt = db.prepare('UPDATE recipes SET slug = ? WHERE id = ?');
    
    for (const recipe of recipesWithoutSlug) {
      const slug = generateUniqueSlug(recipe.title || 'recipe');
      updateStmt.run(slug, recipe.id);
    }
    
    logger.info('Slug migration complete');
  }
};

// Run migration
migrateExistingRecipes();

// Database operations
export const getAllRecipes = () => {
  const stmt = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC');
  return stmt.all();
};

export const getRecipeBySlug = (slug) => {
  const stmt = db.prepare('SELECT * FROM recipes WHERE slug = ?');
  return stmt.get(slug);
};

export const createRecipe = ({ url, title, description, image_url, site_name }) => {
  // Truncate fields as per spec
  const truncatedTitle = title ? title.substring(0, 200) : null;
  const truncatedDescription = description ? description.substring(0, 500) : null;
  
  // Generate unique slug
  const slug = generateUniqueSlug(truncatedTitle || 'recipe');
  
  const stmt = db.prepare(`
    INSERT INTO recipes (url, title, description, image_url, site_name, slug)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(url, truncatedTitle, truncatedDescription, image_url, site_name, slug);
  
  // Return the created recipe
  const getStmt = db.prepare('SELECT * FROM recipes WHERE id = ?');
  return getStmt.get(result.lastInsertRowid);
};

export const deleteRecipe = (id) => {
  const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

export default db;
