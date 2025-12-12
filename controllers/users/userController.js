import userService from '../../services/users/userService.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { movePhotoToUserFolder } from '../../config/multer.js';

const userController = {
    login: async (req, res) => {
        const { login, password } = req.body;
        if (!login || !password) return res.status(400).json({ error: 'All the inputs have to be fulled' });

        try {
            const user = await userService.findByLogin(login);
            if (!user) return res.status(401).json({ error: 'User or password are incorrect' });

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ error: 'User or password are incorrect' });

            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.admin = user.admin;
            req.session.photo = user.photo;

            res.json({ message: 'Successfully Login', userId: user.id, username: user.username, admin: user.admin, photo: user.photo });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    signUp: async (req, res) => {
        try {
            const { username, email, password, admin } = req.body;

            if (!username || !email || admin === undefined || admin === null || !password) {
                return res.status(400).json({ error: 'All the attributes must be complete' });
            }

            if (!validator.isEmail(email)) {
                return res.status(400).json({ error: "Invalid email" });
            }

            if (username.length > 20) return res.status(400).json({ error: 'Username too long' });
            if (email.length > 40) return res.status(400).json({ error: 'Email too long' });
            if (password.length < 8) return res.status(400).json({ error: 'Password too short' });

            const adminValue = parseInt(admin, 10);

            const userId = await userService.createUser(username, email, password, adminValue);

            let photoPath = '/uploads/users/cat_default.webp';

            if (req.file && req.isNewUser) {
                try {
                    photoPath = movePhotoToUserFolder(req.userPhotoFolder, userId, req.file.filename);
                } catch (moveErr) {
                    // Continue with default photo if move fails
                }
            } else if (req.file) {
                photoPath = `/uploads/users/${userId}/${req.file.filename}`;
            }

            await userService.updatePhoto(userId, photoPath);

            res.status(201).json({ id: userId, username, email, photo: photoPath });
        } catch (error) {
            res.status(500).json({ error: error.message || 'An unexpected error occurred' });
        }
    },

    logout: (req, res) => {
        if (req.session) {
            req.session.destroy(err => {
                if (err) return res.status(500).json({ message: 'Could not log out' });
                res.clearCookie('connect.sid');
                res.json({ message: 'Logged out successfully' });
            });
        } else {
            res.status(200).json({ message: 'No active session' });
        }
    },

    getMe: async (req, res) => {
        if (!req.session.userId) return res.json({ loggedIn: false });

        try {
            const user = await userService.findById(req.session.userId);
            if (!user) {
                req.session.destroy();
                return res.json({ loggedIn: false });
            }

            res.json({
                loggedIn: true,
                id: user.id,
                username: user.username,
                email: user.email,
                admin: user.admin,
                photo: user.photo,
                favorites: user.favorites,
                favoritesCss: user.favoritesCss
            });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch user data' });
        }
    },

    getFavorites: async (req, res) => {
        const userId = req.session.userId;
        try {
            const favorites = await userService.getFavorites(userId, 'tags');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });
            res.json({ favorites });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    addFavorite: async (req, res) => {
        const userId = req.session.userId;
        const { tagId } = req.body;

        if (!tagId) return res.status(400).json({ error: 'Tag ID is required' });

        try {
            const favorites = await userService.getFavorites(userId, 'tags');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            const tagIdNum = parseInt(tagId, 10);
            if (isNaN(tagIdNum)) return res.status(400).json({ error: 'Invalid tag ID' });

            if (!favorites.includes(tagIdNum)) {
                favorites.push(tagIdNum);
                await userService.updateFavorites(userId, favorites, 'tags');
            }

            res.json({ message: 'Tag added to favorites', favorites });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    removeFavorite: async (req, res) => {
        const userId = req.session.userId;
        const tagId = parseInt(req.params.tagId, 10);

        if (isNaN(tagId)) return res.status(400).json({ error: 'Invalid tag ID' });

        try {
            let favorites = await userService.getFavorites(userId, 'tags');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            favorites = favorites.filter(id => id !== tagId);
            await userService.updateFavorites(userId, favorites, 'tags');

            res.json({ message: 'Tag removed from favorites', favorites });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getUserById: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

        try {
            const user = await userService.findByIdAdmin(id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getCssFavorites: async (req, res) => {
        const userId = req.session.userId;
        try {
            const favorites = await userService.getFavorites(userId, 'css');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });
            res.json({ favorites });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    addCssFavorite: async (req, res) => {
        const userId = req.session.userId;
        const { propertyId } = req.body;

        if (!propertyId) return res.status(400).json({ error: 'Property ID is required' });

        try {
            const favorites = await userService.getFavorites(userId, 'css');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            const propertyIdNum = parseInt(propertyId, 10);
            if (isNaN(propertyIdNum)) return res.status(400).json({ error: 'Invalid property ID' });

            if (!favorites.includes(propertyIdNum)) {
                favorites.push(propertyIdNum);
                await userService.updateFavorites(userId, favorites, 'css');
            }

            res.json({ message: 'Property added to favorites', favorites });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    removeCssFavorite: async (req, res) => {
        const userId = req.session.userId;
        const propertyId = parseInt(req.params.propertyId, 10);

        if (isNaN(propertyId)) return res.status(400).json({ error: 'Invalid property ID' });

        try {
            let favorites = await userService.getFavorites(userId, 'css');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            favorites = favorites.filter(id => id !== propertyId);
            await userService.updateFavorites(userId, favorites, 'css');

            res.json({ message: 'Property removed from favorites', favorites });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

export default userController;
