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

/**
 * Path to the SQLite database file
 * @constant {string}
 */
const DB_PATH = path.resolve(__dirname, 'database.sqlite');

/**
 * Database connection mode (Read/Write + Create)
 * @constant {number}
 */
const DB_MODE = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;

// ============================================================================
// Internal State and Schema Definitions
// ============================================================================
let dbInstance = null; // CONTROLLED INSTANCE (Starts null)

/**
 * SQL definitions for database tables
 * @constant {Object.<string, string>}
 */
const TABLES = {
  // ... (Your table definitions remain here) ...
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
// Database Initialization Logic (Internal)
// ============================================================================

/**
 * Create all database tables using the provided instance.
 * @param {sqlite3.Database} db The active database instance.
 * @returns {Promise<void>}
 */
const createTables = (db) => {
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

// ============================================================================
// Exported Initialization Function (Called ONLY by app.js)
// ============================================================================

/**
 * Initialize SQLite database connection and schema.
 * @returns {Promise<void>} Resolves when connection is open and tables are created.
 */
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      console.log('✅ Database connection already active.');
      return resolve();
    }

    dbInstance = new sqlite3.Database(DB_PATH, DB_MODE, (err) => {
      if (err) {
        console.error('❌ Failed to connect to SQLite database:', err.message);
        // In production, exit is fine; in tests, you must handle the error without exiting.
        return reject(err);
      }
      console.log('✅ Connected to SQLite database');

      // Enable foreign keys
      dbInstance.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
        if (pragmaErr) {
          console.error('❌ Failed to enable foreign keys:', pragmaErr.message);
          return reject(pragmaErr);
        }

        // Initialize tables only after successful connection
        createTables(dbInstance)
          .then(resolve)
          .catch(reject);
      });
    });
  });
};

// ============================================================================
// Exported Wrappers (Used by services/controllers)
// ============================================================================

/**
 * Validates that the database instance is active.
 * @returns {sqlite3.Database} The active database instance.
 */
const validateDbInstance = () => {
  if (!dbInstance) {
    // This indicates a configuration error if called outside initDatabase.
    throw new Error("Database is not initialized. Call initDatabase() in app.js first.");
  }
  return dbInstance;
};

// Export functions that wrap the active dbInstance
export const get = (sql, params, callback) => {
  return validateDbInstance().get(sql, params, callback);
};

export const run = (sql, params, callback) => {
  return validateDbInstance().run(sql, params, callback);
};

export const all = (sql, params, callback) => {
  return validateDbInstance().all(sql, params, callback);
};

export const prepare = (sql) => {
  return validateDbInstance().prepare(sql);
};

// ============================================================================
// Graceful Shutdown
// ============================================================================

/**
 * Close database connection gracefully
 */
export const closeDatabase = () => {
  if (dbInstance) {
    dbInstance.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
      dbInstance = null;
    });
  }
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
