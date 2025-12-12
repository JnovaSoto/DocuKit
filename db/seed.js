import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

/**
 * Seeds the database with initial data from scriptExample.txt.
 * 
 * This function performs the following steps:
 * 1. Deletes the existing database file if it exists.
 * 2. Dynamically imports the database module to initialize the connection.
 * 3. Reads the SQL script from `scriptExample.txt`.
 * 4. Executes the SQL script to create tables and insert data.
 * 5. Closes the database connection.
 * 
 * @async
 * @function seedDatabase
 * @returns {Promise<void>}
 */
const seedDatabase = async () => {
    // Delete existing database if it exists
    if (fs.existsSync(dbPath)) {
        try {
            fs.unlinkSync(dbPath);
            console.log('🗑️ Existing database deleted');
        } catch (err) {
            if (err.code === 'EBUSY') {
                console.error('❌ Error: Database file is locked. Please stop the running server (npm start) and try again.');
            } else {
                console.error('❌ Error deleting existing database:', err.message);
            }
            process.exit(1);
        }
    }

    // Dynamic import to ensure database is initialized AFTER deletion
    const { default: db } = await import('./database.js');

    // Wait for tables to be created (database.js creates them on load, but async)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const scriptPath = path.join(__dirname, 'scriptExample.txt');

    try {
        const sql = fs.readFileSync(scriptPath, 'utf8');

        console.log('🌱 Seeding database...');

        db.exec(sql, (err) => {
            if (err) {
                console.error('❌ Error seeding database:', err.message);
                process.exit(1);
            }
            console.log('✅ Database seeded successfully');
            console.log('🎟️ User Admin created successfully -> userAdmin12345@gmail.com | password: userAdmin12345');

            db.close((closeErr) => {
                if (closeErr) {
                    console.error('❌ Error closing database:', closeErr.message);
                } else {
                    console.log('✅ Database connection closed');
                }
            });
        });

    } catch (err) {
        console.error('❌ Error reading script file:', err.message);
        process.exit(1);
    }
};

seedDatabase();
