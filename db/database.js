// ============================================================================
// Dependencies
// ============================================================================
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Configuration
// ============================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, 'database.sqlite');
const DB_MODE = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;

// ============================================================================
// Database Connection
// ============================================================================

/**
 * Initialize SQLite database connection
 * @returns {sqlite3.Database} Database instance
 */
const initializeDatabase = () => {
  const db = new sqlite3.Database(DB_PATH, DB_MODE, (err) => {
    if (err) {
      console.error('❌ Failed to connect to SQLite database:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
  });

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  return db;
};

const db = initializeDatabase();

// ============================================================================
// Schema Definitions
// ============================================================================

const TABLES = {
  tags: `
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tagName TEXT NOT NULL UNIQUE,
      usability TEXT,
      content TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  attributes: `
    CREATE TABLE IF NOT EXISTS attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attribute TEXT NOT NULL,
      info TEXT,
      tagId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
    )
  `,

  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      admin INTEGER DEFAULT 0,
      photo TEXT DEFAULT '/uploads/users/cat_default.webp',
      favorites TEXT DEFAULT '[]',
      favoritesCss TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  attribute_metadata: `
    CREATE TABLE IF NOT EXISTS attribute_metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attributeName TEXT NOT NULL UNIQUE,
      generalDescription TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  properties: `
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      propertyName TEXT NOT NULL UNIQUE,
      usability TEXT,
      content TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  property_attributes: `
    CREATE TABLE IF NOT EXISTS property_attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attribute TEXT NOT NULL,
      info TEXT,
      propertyId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
    )
  `
};

// ============================================================================
// Database Initialization
// ============================================================================

/**
 * Create all database tables
 * @returns {Promise<void>}
 */
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const tableNames = Object.keys(TABLES);
      let completed = 0;
      let hasError = false;

      tableNames.forEach((tableName) => {
        db.run(TABLES[tableName], (err) => {
          if (err && !hasError) {
            hasError = true;
            console.error(`❌ Error creating table '${tableName}':`, err.message);
            reject(err);
            return;
          }

          completed++;

          if (completed === tableNames.length && !hasError) {
            console.log('✅ All database tables initialized successfully');
            resolve();
          }
        });
      });
    });
  });
};

// Initialize tables on startup
createTables()
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  });

// ============================================================================
// Graceful Shutdown
// ============================================================================

/**
 * Close database connection gracefully
 */
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
  });
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

// ============================================================================
// Export
// ============================================================================
export default db;
