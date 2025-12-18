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

    // Named imports from database.js
    const { initDatabase, exec, closeDatabase } = await import('./database.js');

    await initDatabase();

    const scriptPath = path.join(__dirname, 'scriptExample.txt');

    try {
        const sql = fs.readFileSync(scriptPath, 'utf8');

        console.log('🌱 Seeding database...');

        exec(sql, (err) => {
            if (err) {
                console.error('❌ Error seeding database:', err.message);
                process.exit(1);
            }
            console.log('✅ Database seeded successfully');
            console.log('🎟️ User Admin created successfully -> userAdmin12345@gmail.com | password: userAdmin12345');

            closeDatabase();
        });

    } catch (err) {
        console.error('❌ Error reading script file:', err.message);
        process.exit(1);
    }
};

seedDatabase();
