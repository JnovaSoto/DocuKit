import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

//When using modules, it is essential to manually create global variables.
const __filename = fileURLToPath(import.meta.url);//Full path of the current file
const __dirname = path.dirname(__filename);//Path of the folder containing the current file

//Using the current directory, access the SQLite database and attempt to connect to it.
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error al conectar SQLite:', err.message);
  else console.log('Conectado a SQLite');
});

//Use serialize to ensure it's the first command executed.
//If the database doesn't exist, create it; if it already exists, ignore this command.
db.serialize(() => {
  // Create tags table
  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tagName TEXT NOT NULL,
      usability TEXT,
      content TEXT
    )
  `);

  // Create attributes table
  db.run(`
    CREATE TABLE IF NOT EXISTS attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attributeName TEXT NOT NULL,
      value TEXT,
      description TEXT
    )
  `);

  // Create attributes table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT,
      admin INTEGER
    )
  `);
});
//Export the database connection for use in another file
export default db;
