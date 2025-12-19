import prisma from '../../db/prisma.js';
import bcrypt from 'bcrypt';

/**
 * Service for handling user-related database operations using Prisma.
 */
const userService = {
    /**
     * Find user by login (username or email).
     * @param {string} login - Username or email.
     * @returns {Promise<Object|null>} User object.
     */
    findByLogin: async (login) => {
        return await prisma.user.findFirst({
            where: {
                OR: [
                    { username: login },
                    { email: login }
                ]
            }
        });
    },

    /**
     * Find user by Google ID.
     * @param {string} googleId - Google profile ID.
     * @returns {Promise<Object|null>} User object.
     */
    findByGoogleId: async (googleId) => {
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
    createUser: async (username, email, password, admin, googleId = null) => {
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
                admin: parseInt(admin),
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
    updatePhoto: async (userId, photoPath) => {
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { photo: photoPath }
        });
    },

    /**
     * Find user by ID.
     * @param {number} id - User ID.
     * @returns {Promise<Object|null>} User object.
     */
    findById: async (id) => {
        return await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                email: true,
                admin: true,
                photo: true,
                favorites: true,
                favoritesCss: true
            }
        });
    },

    /**
     * Find user by ID.
     * @param {number} id - User ID.
     * @returns {Promise<Object|null>} User object.
     */
    findByIdAdmin: async (id) => {
        return await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });
    },

    /**
     * Get user favorites by ID and type.
     * @param {number} userId - User ID.
     * @param {string} type - 'tags' or 'css'.
     * @returns {Promise<Array>} Array of favorite IDs.
     */
    getFavorites: async (userId, type = 'tags') => {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                favorites: type !== 'css',
                favoritesCss: type === 'css'
            }
        });

        if (!user) return null;

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
    updateFavorites: async (userId, favorites, type = 'tags') => {
        const column = type === 'css' ? 'favoritesCss' : 'favorites';
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                [column]: JSON.stringify(favorites)
            }
        });
    }
};

export default userService;
