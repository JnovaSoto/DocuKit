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
// Internal State and Schema Definitions
// ============================================================================
let dbInstance = null;

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
        password TEXT,                -- Opcional para usuarios de Google
        googleId TEXT UNIQUE,          -- Identificador único de Google
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
// Database Initialization Logic
// ============================================================================
const createTables = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const tableNames = Object.keys(TABLES);
        for (const tableName of tableNames) {
          await new Promise((res, rej) => {
            db.run(TABLES[tableName], (err) => {
              if (err) rej(err);
              else res();
            });
          });
        }
        console.log('✅ All database tables initialized successfully');
        resolve();
      } catch (error) {
        console.error(`❌ Database initialization failed:`, error.message);
        reject(error);
      }
    });
  });
};

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve();

    dbInstance = new sqlite3.Database(DB_PATH, DB_MODE, (err) => {
      if (err) {
        console.error('❌ Failed to connect to database:', err.message);
        return reject(err);
      }

      dbInstance.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
        if (pragmaErr) return reject(pragmaErr);

        createTables(dbInstance)
          .then(resolve)
          .catch(reject);
      });
    });
  });
};

// ============================================================================
// Exported Wrappers
// ============================================================================
const validateDbInstance = () => {
  if (!dbInstance) throw new Error("Database not initialized. Call initDatabase() first.");
  return dbInstance;
};

export const get = (sql, params, callback) => validateDbInstance().get(sql, params, callback);
export const run = (sql, params, callback) => validateDbInstance().run(sql, params, callback);
export const all = (sql, params, callback) => validateDbInstance().all(sql, params, callback);
export const prepare = (sql) => validateDbInstance().prepare(sql);
export const exec = (sql, callback) => validateDbInstance().exec(sql, callback);

// ============================================================================
// Graceful Shutdown
// ============================================================================
export const closeDatabase = () => {
  if (dbInstance) {
    dbInstance.close((err) => {
      if (err) console.error('❌ Error closing database:', err.message);
      else console.log('✅ Database connection closed');
    });
    dbInstance = null;
  }
};