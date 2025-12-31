import userService from '../../services/users/userService.js';
import { Request, Response } from 'express';
interface MulterRequest extends Request {
    isNewUser?: boolean;
    userPhotoFolder?: string;
}
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { movePhotoToUserFolder } from '../../config/multer.js';
import { User } from '@prisma/client';
import { loginSchema, signUpSchema, favoriteSchema, cssFavoriteSchema } from '../../schemas/userSchema.js';

const userController = {
    /**
     * Authenticate and login a user.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    login: async (req: Request, res: Response) => {
        try {
            const validatedData = loginSchema.parse(req.body);
            const { login, password } = validatedData;

            const user = await userService.findByLogin({ login, password });
            if (!user) return res.status(401).json({ error: 'User or password are incorrect' });

            const match = await bcrypt.compare(password, user.password ?? "");
            if (!match) return res.status(401).json({ error: 'User or password are incorrect' });

            req.session.regenerate((err) => {
                if (err) return res.status(500).json({ error: 'Session regeneration failed' });

                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.admin = user.admin ?? 0;

                res.json({ message: 'Successfully Login', userId: user.id, username: user.username, admin: user.admin });
            });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            res.status(500).json({ error: err.message });
        }
    },

    googleLogin: async (req: Request, res: Response) => {

        const user = req.user as User;

        if (!user) return res.status(401).json({ error: 'User not found' });

        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: 'Session regeneration failed' });
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.admin = user.admin ?? 0;
            res.redirect('/');
        });
    },

    /**
     * Register a new user.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    signUp: async (req: MulterRequest, res: Response) => {
        try {
            const validatedData = signUpSchema.parse(req.body);
            const { username, email, password, admin, googleId } = validatedData;

            const userId = await userService.createUser(username, email, password, admin, googleId);

            let photoPath = '/uploads/users/cat_default.webp';

            if (req.file && req.isNewUser) {
                try {
                    photoPath = movePhotoToUserFolder(req.userPhotoFolder!, userId, req.file.filename);
                } catch (moveErr) {
                    // Continue with default photo if move fails
                }
            } else if (req.file) {
                photoPath = `/uploads/users/${userId}/${req.file.filename}`;
            }

            await userService.updatePhoto(userId, photoPath);

            res.status(201).json({ id: userId, username, email, photo: photoPath });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            res.status(500).json({ error: err.message || 'An unexpected error occurred' });
        }
    },

    /**
     * Logout the current user.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    logout: (req: Request, res: Response) => {
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

    /**
     * Get current user's session data.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getMe: async (req: Request, res: Response) => {
        if (!req.session.userId) return res.json({ loggedIn: false });

        try {
            const user = await userService.findById(req.session.userId);

            if (!user) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error("Error destroying session:", err);
                    }
                });
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

    /**
     * Get current user's favorite tags.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getFavorites: async (req: Request, res: Response) => {
        const userId: number = req.session.userId!;
        try {
            const favorites = await userService.getFavorites(userId, 'tags');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });
            res.json({ favorites });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Add a tag to favorites.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    addFavorite: async (req: Request, res: Response) => {
        const userId: number = req.session.userId!;

        try {
            const validatedData = favoriteSchema.parse(req.body);
            const { tagId } = validatedData;

            const favorites = await userService.getFavorites(userId, 'tags');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            if (!favorites.includes(tagId)) {
                favorites.push(tagId);
                await userService.updateFavorites(userId, favorites, 'tags');
            }

            res.json({ message: 'Tag added to favorites', favorites });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Remove a tag from favorites.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    removeFavorite: async (req: Request, res: Response) => {
        const userId: number = req.session.userId!;
        const tagId = parseInt(req.params.tagId, 10);

        if (isNaN(tagId)) return res.status(400).json({ error: 'Invalid tag ID' });

        try {
            let favorites = await userService.getFavorites(userId, 'tags');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            favorites = favorites.filter(id => id !== tagId);
            await userService.updateFavorites(userId, favorites, 'tags');

            res.json({ message: 'Tag removed from favorites', favorites });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get user by ID (Admin).
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getUserById: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

        try {
            const user = await userService.findByIdAdmin(id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get current user's CSS property favorites.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getCssFavorites: async (req: Request, res: Response) => {
        const userId: number = req.session.userId!;
        try {
            const favorites = await userService.getFavorites(userId, 'css');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });
            res.json({ favorites });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Add a CSS property to favorites.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    addCssFavorite: async (req: Request, res: Response) => {
        const userId: number = req.session.userId!;

        try {
            const validatedData = cssFavoriteSchema.parse(req.body);
            const { propertyId } = validatedData;

            const favorites = await userService.getFavorites(userId, 'css');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            if (!favorites.includes(propertyId)) {
                favorites.push(propertyId);
                await userService.updateFavorites(userId, favorites, 'css');
            }

            res.json({ message: 'Property added to favorites', favorites });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Remove a CSS property from favorites.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    removeCssFavorite: async (req: Request, res: Response) => {
        const userId: number = req.session.userId!;
        const propertyId = parseInt(req.params.propertyId, 10);

        if (isNaN(propertyId)) return res.status(400).json({ error: 'Invalid property ID' });

        try {
            let favorites = await userService.getFavorites(userId, 'css');
            if (favorites === null) return res.status(404).json({ error: 'User not found' });

            favorites = favorites.filter(id => id !== propertyId);
            await userService.updateFavorites(userId, favorites, 'css');

            res.json({ message: 'Property removed from favorites', favorites });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};

export default userController;
