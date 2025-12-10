import express from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import db from '../db/database.js';
import { isAdminLevel1, isAuthenticated } from '../middleware/auth.js';
import ROUTES from '../config/routes.js';
import upload, { movePhotoToUserFolder } from '../config/multer.js';

/**
 * @typedef {import('../models/user.js').User} User
 */
const router = express.Router();

/**
 * Login a user.
 */
router.post(ROUTES.USERS.LOGIN, (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'All the inputs have to be fulled' });

  const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;

  db.get(sql, [login, login], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'User or password are incorrect' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'User or password are incorrect' });

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.admin = user.admin;
    req.session.photo = user.photo;

    res.json({ message: 'Successfully Login', userId: user.id, username: user.username, admin: user.admin, photo: user.photo });
  });
});
/**
 * Create a new user account with photo upload support.
 */
router.post(ROUTES.USERS.SIGNUP, upload.single('photo'), async (req, res) => {
  try {
    const { username, email, password, admin } = req.body;
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    if (!username || !email || admin === undefined || admin === null || !hash) {
      return res.status(400).json({ error: 'All the attributes must be complete' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (username.length > 20) return res.status(400).json({ error: 'Username too long' });
    if (email.length > 40) return res.status(400).json({ error: 'Email too long' });
    if (password.length < 8) return res.status(400).json({ error: 'Password too short' });

    const adminValue = parseInt(admin, 10);
    const sql = `INSERT INTO users (username, email, password, admin) VALUES (?, ?, ?, ?)`;

    db.run(sql, [username, email, hash, adminValue], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const userId = this.lastID;
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

      const updateSql = `UPDATE users SET photo = ? WHERE id = ?`;
      db.run(updateSql, [photoPath, userId], (updateErr) => {
        if (updateErr) console.error('Error updating photo path:', updateErr);
        res.status(201).json({ id: userId, username, email, photo: photoPath });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

/**
 * Logout a user.
 */
router.post(ROUTES.USERS.LOGOUT, (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ message: 'Could not log out' });
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'No active session' });
  }
});

/**
 * Get the current user's data.
 */
router.get(ROUTES.USERS.ME, (req, res) => {
  if (!req.session.userId) return res.json({ loggedIn: false });

  const sql = `SELECT id, username, email, admin, photo, favorites, favoritesCss FROM users WHERE id = ?`;

  db.get(sql, [req.session.userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch user data' });

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
  });
});

/**
 * Get the current user's favorites.
 */
router.get(ROUTES.USERS.FAVORITES, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const sql = `SELECT favorites FROM users WHERE id = ?`;

  db.get(sql, userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    if (!row.favorites) return res.json({ favorites: [] });

    let favorites = [];
    try {
      favorites = row.favorites ? JSON.parse(row.favorites) : [];
    } catch (parseErr) {
      favorites = [];
    }

    res.json({ favorites });
  });
});

/**
 * Add or remove a tag from the current user's favorites.
 */
router.post(ROUTES.USERS.FAVORITES, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { tagId } = req.body;

  if (!tagId) return res.status(400).json({ error: 'Tag ID is required' });

  const selectSql = `SELECT favorites FROM users WHERE id = ?`;
  db.get(selectSql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });

    let favorites = [];
    try {
      favorites = row.favorites ? JSON.parse(row.favorites) : [];
    } catch (parseErr) {
      favorites = [];
    }

    const tagIdNum = parseInt(tagId, 10);
    if (isNaN(tagIdNum)) return res.status(400).json({ error: 'Invalid tag ID' });

    if (!favorites.includes(tagIdNum)) {
      favorites.push(tagIdNum);
    }

    const updateSql = `UPDATE users SET favorites = ? WHERE id = ?`;
    db.run(updateSql, [JSON.stringify(favorites), userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Tag added to favorites', favorites });
    });
  });
});

/**
 * Remove a tag from the current user's favorites.
 */
router.delete(`${ROUTES.USERS.FAVORITES}/:tagId`, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const tagId = parseInt(req.params.tagId, 10);

  if (isNaN(tagId)) return res.status(400).json({ error: 'Invalid tag ID' });

  const selectSql = `SELECT favorites FROM users WHERE id = ?`;
  db.get(selectSql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });

    let favorites = [];
    try {
      favorites = row.favorites ? JSON.parse(row.favorites) : [];
    } catch (parseErr) {
      favorites = [];
    }

    favorites = favorites.filter(id => id !== tagId);

    const updateSql = `UPDATE users SET favorites = ? WHERE id = ?`;
    db.run(updateSql, [JSON.stringify(favorites), userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Tag removed from favorites', favorites });
    });
  });
});

/**
 * Get a user by ID.
 */
router.get(ROUTES.USERS.BY_ID, isAdminLevel1, (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

  const sql = `SELECT * FROM users WHERE ID = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

/**
 * Get the current user's CSS property favorites.
 */
router.get(ROUTES.USERS.FAVORITES_CSS, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const sql = `SELECT favoritesCss FROM users WHERE id = ?`;

  db.get(sql, userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    if (!row.favoritesCss) return res.json({ favorites: [] });

    let favorites = [];
    try {
      favorites = row.favoritesCss ? JSON.parse(row.favoritesCss) : [];
    } catch (parseErr) {
      favorites = [];
    }

    res.json({ favorites });
  });
});

/**
 * Add a CSS property to the current user's favorites.
 */
router.post(ROUTES.USERS.FAVORITES_CSS, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { propertyId } = req.body;

  if (!propertyId) return res.status(400).json({ error: 'Property ID is required' });

  const selectSql = `SELECT favoritesCss FROM users WHERE id = ?`;
  db.get(selectSql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });

    let favorites = [];
    try {
      favorites = row.favoritesCss ? JSON.parse(row.favoritesCss) : [];
    } catch (parseErr) {
      favorites = [];
    }

    const propertyIdNum = parseInt(propertyId, 10);
    if (isNaN(propertyIdNum)) return res.status(400).json({ error: 'Invalid property ID' });

    if (!favorites.includes(propertyIdNum)) {
      favorites.push(propertyIdNum);
    }

    const updateSql = `UPDATE users SET favoritesCss = ? WHERE id = ?`;
    db.run(updateSql, [JSON.stringify(favorites), userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Property added to favorites', favorites });
    });
  });
});

/**
 * Remove a CSS property from the current user's favorites.
 */
router.delete(`${ROUTES.USERS.FAVORITES_CSS}/:propertyId`, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const propertyId = parseInt(req.params.propertyId, 10);

  if (isNaN(propertyId)) return res.status(400).json({ error: 'Invalid property ID' });

  const selectSql = `SELECT favoritesCss FROM users WHERE id = ?`;
  db.get(selectSql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });

    let favorites = [];
    try {
      favorites = row.favoritesCss ? JSON.parse(row.favoritesCss) : [];
    } catch (parseErr) {
      favorites = [];
    }

    favorites = favorites.filter(id => id !== propertyId);

    const updateSql = `UPDATE users SET favoritesCss = ? WHERE id = ?`;
    db.run(updateSql, [JSON.stringify(favorites), userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Property removed from favorites', favorites });
    });
  });
});

export default router;
