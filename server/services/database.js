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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

logger.info('Database tables initialized');

// Database operations
export const getAllRecipes = () => {
  const stmt = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC');
  return stmt.all();
};

export const createRecipe = ({ url, title, description, image_url, site_name }) => {
  // Truncate fields as per spec
  const truncatedTitle = title ? title.substring(0, 200) : null;
  const truncatedDescription = description ? description.substring(0, 500) : null;
  
  const stmt = db.prepare(`
    INSERT INTO recipes (url, title, description, image_url, site_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(url, truncatedTitle, truncatedDescription, image_url, site_name);
  
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
