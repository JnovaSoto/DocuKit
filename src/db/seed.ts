import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import prisma from './prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

/**
 * Seeds the database with initial data from scriptExample.txt using Prisma.
 */
const seedDatabase = async () => {
    // Delete existing database if it exists to start fresh
    if (fs.existsSync(dbPath)) {
        try {
            fs.unlinkSync(dbPath);
            console.log('🗑️ Existing database deleted');
        } catch (err: any) {
            if (err.code === 'EBUSY') {
                console.error('❌ Error: Database file is locked. Please stop the running server and try again.');
            } else {
                console.error('❌ Error deleting existing database:', err.message);
            }
            process.exit(1);
        }
    }

    try {
        console.log('🏗️ Synchronizing database schema...');
        // Use prisma db push to recreate the schema without needing migrations for a fresh seed
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

        const scriptPath = path.join(__dirname, 'scriptExample.txt');
        const sql = fs.readFileSync(scriptPath, 'utf8');

        console.log('🌱 Seeding database with initial data...');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await prisma.$executeRawUnsafe(statement);
        }

        console.log('✅ Database seeded successfully');
        console.log('🎟️ User Admin created successfully -> userAdmin12345@gmail.com | password: userAdmin12345');

    } catch (err: any) {
        console.error('❌ Error during seeding:', err.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

seedDatabase();
