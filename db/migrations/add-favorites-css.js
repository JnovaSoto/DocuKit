/**
 * Migration script to add favoritesCss column to existing users table
 * Run this once to update your existing database
 */
import db from '../database.js';

// Add favoritesCss column if it doesn't exist
db.run(`
  ALTER TABLE users ADD COLUMN favoritesCss TEXT DEFAULT '[]'
`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('ℹ️  Column "favoritesCss" already exists, skipping migration');
        } else {
            console.error('❌ Migration failed:', err.message);
        }
    } else {
        console.log('✅ Successfully added "favoritesCss" column to users table');
    }

    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
    });
});
