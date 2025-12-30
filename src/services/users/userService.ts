import prisma from '../../db/prisma.js';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { LoginRequest } from '../../types/user.js';

/**
 * Service for handling user-related database operations using Prisma.
 */
const userService = {
    /**
     * Find user by login (username or email).
     * @param {LoginRequest} data - Login credentials containing username/email and password.
     * @returns {Promise<User|null>} The user object if found, otherwise null.
     */
    findByLogin: async (data: LoginRequest): Promise<User | null> => {
        return await prisma.user.findFirst({
            where: {
                OR: [
                    { username: data.login },
                    { email: data.login }
                ]
            }
        });
    },

    /**
     * Find user by Google ID.
     * @param {string} googleId - The unique Google profile ID.
     * @returns {Promise<User|null>} The user object if found, otherwise null.
     */
    findByGoogleId: async (googleId: string): Promise<User | null> => {
        return await prisma.user.findUnique({
            where: { googleId }
        });
    },

    /**
     * Create a new user in the database.
     * @param {string} username - The desired username.
     * @param {string} email - The user's email address.
     * @param {string} [password] - The user's password (optional for Google OAuth users).
     * @param {number} admin - The admin status (0 for regular, 1 for admin).
     * @param {string} [googleId] - The Google ID for OAuth users.
     * @returns {Promise<number>} The ID of the newly created user.
     */
    createUser: async (username: string, email: string, password: string, admin: number, googleId: string): Promise<number> => {
        let hash = null;
        if (password) {
            const saltRounds = 10;
            hash = await bcrypt.hash(password, saltRounds);
        }

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hash,
                admin,
                googleId
            }
        });
        return user.id;
    },

    /**
     * Update the path to the user's profile photo.
     * @param {number} userId - The ID of the user.
     * @param {string} photoPath - The filesystem path or URL to the photo.
     * @returns {Promise<void>}
     */
    updatePhoto: async (userId: number, photoPath: string): Promise<void> => {
        await prisma.user.update({
            where: { id: userId },
            data: { photo: photoPath }
        });
    },

    /**
     * Find a user by their primary key ID.
     * @param {number} id - The user ID.
     * @returns {Promise<User|null>} The user object if found, otherwise null.
     */
    findById: async (id: number): Promise<User | null> => {
        return await prisma.user.findUnique({
            where: { id: id }
        });
    },

    /**
     * Find a user by their ID for admin purposes.
     * @param {number} id - The user ID.
     * @returns {Promise<object|null>} The user object if found, otherwise null.
     */
    findByIdAdmin: async (id: number): Promise<object | null> => {
        return await prisma.user.findUnique({
            where: { id: id }
        });
    },

    /**
     * Get the list of favorites for a user by type.
     * @param {number} userId - The ID of the user.
     * @param {string} [type='tags'] - The type of favorites to retrieve ('tags' or 'css').
     * @returns {Promise<number[]>} An array of favorite entity IDs.
     */
    getFavorites: async (userId: number, type = 'tags'): Promise<Array<number>> => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                favorites: type !== 'css',
                favoritesCss: type === 'css'
            }
        });

        if (!user) return [];

        const column = type === 'css' ? 'favoritesCss' : 'favorites';
        const data = user[column as keyof typeof user];

        try {
            return data ? JSON.parse(data as string) : [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Update the list of favorites for a user.
     * @param {number} userId - The ID of the user.
     * @param {number[]} favorites - The new array of favorite IDs.
     * @param {string} [type='tags'] - The type of favorites to update ('tags' or 'css').
     * @returns {Promise<void>}
     */
    updateFavorites: async (userId: number, favorites: Array<number>, type = 'tags'): Promise<void> => {
        const column = type === 'css' ? 'favoritesCss' : 'favorites';
        await prisma.user.update({
            where: { id: userId },
            data: {
                [column]: JSON.stringify(favorites)
            }
        });
    }

};

export default userService;
