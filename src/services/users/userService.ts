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
     * @param {string} login - Username or email.
     * @returns {Promise<User|null>} User object.
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
     * @param {string} googleId - Google profile ID.
     * @returns {Promise<User|null>} User object.
     */
    findByGoogleId: async (googleId: string): Promise<User | null> => {
        return await prisma.user.findUnique({
            where: { googleId }
        });
    },

    /**
     * Create a new user.
     * @param {string} username - User's username.
     * @param {string} email - User's email.
     * @param {string} [password] - User's password (optional for Google users).
     * @param {number} admin - Admin status (0 or 1).
     * @param {string} [googleId] - Google ID (optional).
     * @returns {Promise<number>} New user ID.
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
     * Update user photo path.
     * @param {number} userId - ID of the user.
     * @param {string} photoPath - Path to the user's photo.
     * @returns {Promise<void>}
     */
    updatePhoto: async (userId: number, photoPath: string): Promise<void> => {
        await prisma.user.update({
            where: { id: userId },
            data: { photo: photoPath }
        });
    },

    /**
     * Find user by ID.
     * @param {number} id - User ID.
     * @returns {Promise<Object|null>} User object.
     */
    findById: async (id: number): Promise<User | null> => {
        return await prisma.user.findUnique({
            where: { id: id }
        });
    },

    /**
     * Find user by ID.
     * @param {number} id - User ID.
     * @returns {Promise<Object|null>} User object.
     */
    findByIdAdmin: async (id: number): Promise<object | null> => {
        return await prisma.user.findUnique({
            where: { id: id }
        });
    },

    /**
     * Get user favorites by ID and type.
     * @param {number} userId - User ID.
     * @param {string} type - 'tags' or 'css'.
     * @returns {Promise<Array>} Array of favorite IDs.
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
        const data = user[column];

        try {
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Update user favorites.
     * @param {number} userId - User ID.
     * @param {Array} favorites - Array of favorite IDs.
     * @param {string} type - 'tags' or 'css'.
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
