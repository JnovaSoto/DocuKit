/**
 * User routes.
 * Handles user authentication, registration, and session management.
 */

import express from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import db from '../db/database.js';
import { isAdminLevel1, isAuthenticated } from '../middleware/auth.js';
import ROUTES from '../config/routes.js';
import upload, { movePhotoToUserFolder } from '../config/multer.js';

const router = express.Router();

/**
 * Create a new user account.
 * @route POST /users/user
 */
router.post(ROUTES.USERS.SIGNUP, upload.single('photo'), async (req, res) => {
  try {
    const { username, email, password, admin } = req.body;

    console.log('📝 Signup request received:', { username, email, admin, hasFile: !!req.file });

    const saltRounds = 10;

    // Hash password
    const hash = await bcrypt.hash(password, saltRounds);

    console.log('Inserting user:', username, email, admin ? "Admin" : "User");

    // Validate input (admin can be string "0" from FormData)
    if (!username || !email || admin === undefined || admin === null || !hash) {
      console.error('❌ Validation failed: Missing required fields');
      return res.status(400).json({ error: 'All the attributes must be complete' });
    }

    if (!validator.isEmail(email)) {
      console.error('❌ Validation failed: Invalid email');
      return res.status(400).json({ error: "Invalid email" });
    }

    if (username.length > 20) {
      console.error('❌ Validation failed: Username too long');
      return res.status(400).json({ error: 'Username too long' });
    }
    if (email.length > 40) {
      console.error('❌ Validation failed: Email too long');
      return res.status(400).json({ error: 'Email too long' });
    }
    if (password.length < 8) {
      console.error('❌ Validation failed: Password too short');
      return res.status(400).json({ error: 'Password too short' });
    }

    // Convert admin to integer (it comes as string from FormData)
    const adminValue = parseInt(admin, 10);

    // Insert user into DB first (without photo path)
    const sql = `INSERT INTO users (username, email, password, admin) VALUES (?, ?, ?, ?)`;
    db.run(sql, [username, email, hash, adminValue], function (err) {
      if (err) {
        console.error('❌ Database error:', err.message);
        return res.status(500).json({ error: err.message });
      }

      const userId = this.lastID;
      let photoPath = '/uploads/users/cat_default.webp';

      // If file was uploaded, move it to user's folder and update photo path
      if (req.file && req.isNewUser) {
        try {
          console.log('📸 Moving photo from temp folder to user folder:', userId);
          photoPath = movePhotoToUserFolder(req.userPhotoFolder, userId, req.file.filename);
          console.log('✅ Photo moved successfully:', photoPath);
        } catch (moveErr) {
          console.error('❌ Error moving photo:', moveErr);
          // Continue with default photo if move fails
        }
      } else if (req.file) {
        // File already in correct folder (existing user)
        photoPath = `/uploads/users/${userId}/${req.file.filename}`;
      }

      // Update user with photo path
      const updateSql = `UPDATE users SET photo = ? WHERE id = ?`;
      db.run(updateSql, [photoPath, userId], (updateErr) => {
        if (updateErr) {
          console.error('❌ Error updating photo path:', updateErr);
        }

        console.log('✅ User created with photo:', photoPath);
        res.status(201).json({ id: userId, username, email, photo: photoPath });
      });
    });
  } catch (error) {
    console.error('❌ Unexpected error in signup:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

/**
 * Log in user with username or email.
 * @route POST /users/login
 */
router.post(ROUTES.USERS.LOGIN, (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) return res.status(400).json({ error: 'All the inputs have to be fulled' });

  // Find user by username OR email
  const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;

  db.get(sql, [login, login], async (err, user) => {
    console.log('User from DB:', user);
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'User or password are incorrect' });

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'User or password are incorrect' });

    // Save session (use photo field)
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.admin = user.admin;
    req.session.photo = user.photo;

    res.json({ message: 'Successfully Login', userId: user.id, username: user.username, admin: user.admin, photo: user.photo });
  });
});

/**
 * Log out current user.
 * @route POST /users/logout
 */
router.post(ROUTES.USERS.LOGOUT, (req, res) => {

  if (req.session) {
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Could not log out' });
      }
      // Clear cookie 
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'No active session' });
  }
});

/**
 * Check if user is logged in and get their full profile data.
 * @route GET /users/me
 */
router.get(ROUTES.USERS.ME, (req, res) => {
  if (!req.session.userId) {
    return res.json({ loggedIn: false });
  }

  // Fetch full user data from database
  const sql = `SELECT id, username, email, admin, photo, favorites FROM users WHERE id = ?`;

  db.get(sql, [req.session.userId], (err, user) => {
    if (err) {
      console.error('❌ Error fetching user data:', err);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    if (!user) {
      // User not found in DB but has session - clear session
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
      favorites: user.favorites
    });
  });
});

/**
 * Get user's favorite tags.
 * @route GET /users/favorites
 */
router.get(ROUTES.USERS.FAVORITES, isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  const sql = `SELECT favorites FROM users WHERE id = ?`;
  db.get(sql, userId, (err, row) => {
    if (err) {
      console.error('❌ Error fetching favorites:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!row.favorites) {
      return res.json({ favorites: [] });
    }

    // Parse favorites JSON string to array
    let favorites = [];
    try {
      favorites = row.favorites ? JSON.parse(row.favorites) : [];
    } catch (parseErr) {
      console.error('❌ Error parsing favorites:', parseErr);
      favorites = [];
    }

    res.json({ favorites });
  });
});

/**
 * Add a tag to user's favorites.
 * @route POST /users/favorites
 */
router.post(ROUTES.USERS.FAVORITES, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { tagId } = req.body;

  if (!tagId) {
    return res.status(400).json({ error: 'Tag ID is required' });
  }

  // First, get current favorites
  const selectSql = `SELECT favorites FROM users WHERE id = ?`;
  db.get(selectSql, [userId], (err, row) => {
    if (err) {
      console.error('❌ Error fetching favorites:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse current favorites
    let favorites = [];
    try {
      favorites = row.favorites ? JSON.parse(row.favorites) : [];
    } catch (parseErr) {
      console.error('❌ Error parsing favorites:', parseErr);
      favorites = [];
    }

    // Update database
    const updateSql = `UPDATE users SET favorites = ? WHERE id = ?`;
    db.run(updateSql, [JSON.stringify(favorites), userId], function (err) {
      if (err) {
        console.error('❌ Error updating favorites:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('✅ Added tag to favorites:', tagIdNum);
      res.json({ message: 'Tag added to favorites', favorites });
    });
  });
});

/**
 * Remove a tag from user's favorites.
 * @route DELETE /users/favorites/:tagId
 */
router.delete(`${ROUTES.USERS.FAVORITES}/:tagId`, isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const tagId = parseInt(req.params.tagId, 10);

  if (isNaN(tagId)) {
    return res.status(400).json({ error: 'Invalid tag ID' });
  }

  // First, get current favorites
  const selectSql = `SELECT favorites FROM users WHERE id = ?`;
  db.get(selectSql, [userId], (err, row) => {
    if (err) {
      console.error('❌ Error fetching favorites:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse current favorites
    let favorites = [];
    try {
      favorites = row.favorites ? JSON.parse(row.favorites) : [];
    } catch (parseErr) {
      console.error('❌ Error parsing favorites:', parseErr);
      favorites = [];
    }

    // Remove tagId from favorites
    favorites = favorites.filter(id => id !== tagId);

    // Update database
    const updateSql = `UPDATE users SET favorites = ? WHERE id = ?`;
    db.run(updateSql, [JSON.stringify(favorites), userId], function (err) {
      if (err) {
        console.error('❌ Error updating favorites:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('✅ Removed tag from favorites:', tagId);
      res.json({ message: 'Tag removed from favorites', favorites });
    });
  });
});

/**
 * Get user by ID (admin only).
 * @route GET /users/:id
 */
router.get(ROUTES.USERS.BY_ID, isAdminLevel1, (req, res) => {
  console.log("Before getting the user with the id = " + req.params.id);
  const id = parseInt(req.params.id);
  console.log("After getting the user with the id = " + id);

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

  const sql = `SELECT * FROM users WHERE ID = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});


export default router;
