import express from 'express';
import { isAdminLevel1, isAuthenticated } from '../middleware/auth.js';
import ROUTES from '../config/routes.js';
import upload from '../config/multer.js';
import userController from '../controllers/users/userController.js';
import passport from '../config/passport.js';

// User routes
const router = express.Router();

/**
 * Login a user.
 * 
 * @name Login
 * @route {POST} /users/login
 */
router.post(ROUTES.USERS.LOGIN, userController.login);

/**
 * Create a new user account with photo upload support.
 * 
 * @name Sign Up
 * @route {POST} /users/signUp
 */
router.post(ROUTES.USERS.SIGNUP, upload.single('photo'), userController.signUp);

/**
 * Logout a user.
 * 
 * @name Logout
 * @route {POST} /users/logout
 */
router.post(ROUTES.USERS.LOGOUT, userController.logout);

/**
 * Get the current user's data.
 * 
 * @name Get Current User
 * @route {GET} /users/me
 */
router.get(ROUTES.USERS.ME, userController.getMe);

/**
 * Get the current user's favorite tags.
 * 
 * @name Get Favorites
 * @route {GET} /users/favorites
 */
router.get(ROUTES.USERS.FAVORITES, isAuthenticated, userController.getFavorites);

/**
 * Add a tag to the current user's favorites.
 * 
 * @name Add Favorite
 * @route {POST} /users/favorites
 */
router.post(ROUTES.USERS.FAVORITES, isAuthenticated, userController.addFavorite);

/**
 * Remove a tag from the current user's favorites.
 * 
 * @name Remove Favorite
 * @route {DELETE} /users/favorites/:tagId
 */
router.delete(`${ROUTES.USERS.FAVORITES}/:tagId`, isAuthenticated, userController.removeFavorite);

/**
 * Get a user by ID (Admin only).
 * 
 * @name Get User By ID
 * @route {GET} /users/:id
 */
router.get(ROUTES.USERS.BY_ID, isAdminLevel1, userController.getUserById);

/**
 * Get the current user's CSS property favorites.
 * 
 * @name Get CSS Favorites
 * @route {GET} /users/favorites-css
 */
router.get(ROUTES.USERS.FAVORITES_CSS, isAuthenticated, userController.getCssFavorites);

/**
 * Add a CSS property to the current user's favorites.
 * 
 * @name Add CSS Favorite
 * @route {POST} /users/favorites-css
 */
router.post(ROUTES.USERS.FAVORITES_CSS, isAuthenticated, userController.addCssFavorite);

/**
 * Remove a CSS property from the current user's favorites.
 * 
 * @name Remove CSS Favorite
 * @route {DELETE} /users/favorites-css/:propertyId
 */
router.delete(`${ROUTES.USERS.FAVORITES_CSS}/:propertyId`, isAuthenticated, userController.removeCssFavorite);

/**
 * Initiate Google OAuth authentication.
 * 
 * @name Google Auth
 * @route {GET} /users/google
 */
router.get(ROUTES.USERS.GOOGLE, passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * Handle Google OAuth callback.
 * 
 * @name Google Auth Callback
 * @route {GET} /users/google/callback
 */
router.get(ROUTES.USERS.GOOGLE_CALLBACK,
    passport.authenticate('google', { failureRedirect: '/logIn' }),
    (req, res) => {
        req.session.userId = req.user.id;
        req.session.username = req.user.username;
        req.session.admin = req.user.admin;
        req.session.photo = req.user.photo;
        res.redirect('/');
    }
);

export default router;
