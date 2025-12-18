import { get, run } from '../../db/database.js';
import bcrypt from 'bcrypt';

const userService = {
    /**
     * Find user by login (username or email).
     * @param {string} login - Username or email.
     * @returns {Promise<Object>} User object.
     */
    findByLogin: (login) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;
            get(sql, [login, login], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    /**
     * Find user by Google ID.
     * @param {string} googleId - Google profile ID.
     * @returns {Promise<Object>} User object.
     */
    findByGoogleId: (googleId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE googleId = ?`;
            get(sql, [googleId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
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

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (username, email, password, admin, googleId) VALUES (?, ?, ?, ?, ?)`;
            run(sql, [username, email, hash, admin, googleId], function (err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    },

    /**
     * Update user photo path.
     * @param {number} userId - ID of the user.
     * @param {string} photoPath - Path to the user's photo.
     * @returns {Promise<void>}
     */
    updatePhoto: (userId, photoPath) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET photo = ? WHERE id = ?`;
            run(sql, [photoPath, userId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    /**
     * Find user by ID.
     * @param {number} id - User ID.
     * @returns {Promise<Object>} User object.
     */
    findById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id, username, email, admin, photo, favorites, favoritesCss FROM users WHERE id = ?`;
            get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    /**
     * Find user by ID (for admin, returns all fields including password hash if needed, but usually limited).
     * @param {number} id - User ID.
     * @returns {Promise<Object>} User object.
     */
    findByIdAdmin: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE ID = ?`;
            get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    /**
     * Get user favorites by ID and type.
     * @param {number} userId - User ID.
     * @param {string} type - 'tags' or 'css'.
     * @returns {Promise<Array>} Array of favorite IDs.
     */
    getFavorites: (userId, type = 'tags') => {
        return new Promise((resolve, reject) => {
            const column = type === 'css' ? 'favoritesCss' : 'favorites';
            const sql = `SELECT ${column} FROM users WHERE id = ?`;
            get(sql, [userId], (err, row) => {
                if (err) reject(err);
                if (!row) return resolve(null); // User not found
                try {
                    const favorites = row[column] ? JSON.parse(row[column]) : [];
                    resolve(favorites);
                } catch (parseErr) {
                    resolve([]);
                }
            });
        });
    },

    /**
     * Update user favorites.
     * @param {number} userId - User ID.
     * @param {Array} favorites - Array of favorite IDs.
     * @param {string} type - 'tags' or 'css'.
     * @returns {Promise<void>}
     */
    updateFavorites: (userId, favorites, type = 'tags') => {
        return new Promise((resolve, reject) => {
            const column = type === 'css' ? 'favoritesCss' : 'favorites';
            const sql = `UPDATE users SET ${column} = ? WHERE id = ?`;
            run(sql, [JSON.stringify(favorites), userId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
};

export default userService;
