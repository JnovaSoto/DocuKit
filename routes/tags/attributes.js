import express from 'express';
import db from '../../db/database.js';
import { isAuthenticated } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';

const router = express.Router();

/**
 * Get all attributes.
 * 
 * @name Get All Attributes
 * @route {GET} /attributes
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.ATTRIBUTES.BASE, (req, res) => {
  const sql = `SELECT * FROM attributes`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * Create new attributes (Authenticated users).
 * 
 * @name Create Attributes
 * @route {POST} /attributes/create
 * @param {Object} req.body - The request body
 * @param {number} req.body.tagId - The ID of the associated tag
 * @param {Array<Object>} req.body.attributes - Array of attribute objects
 * @param {express.Response} res - Express response object
 */
router.post(ROUTES.ATTRIBUTES.CREATE, isAuthenticated, (req, res) => {
  const { tagId, attributes } = req.body;

  if (!Array.isArray(attributes)) {
    return res.status(400).json({ error: 'attributes must be an array.' });
  }

  const sql = `INSERT INTO attributes (attribute, info, tagId) VALUES (?, ?, ?)`;
  const stmt = db.prepare(sql);

  for (const attr of attributes) {
    if (!attr.attribute) continue;
    stmt.run([attr.attribute, attr.info, tagId]);
  }

  stmt.finalize(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Attributes added successfully' });
  });
});

/**
 * Get attributes by tag ID.
 * 
 * @name Get Attributes By Tag ID
 * @route {GET} /attributes/tag/:id
 * @param {express.Request} req - Express request object
 * @param {string} req.params.id - The ID of the tag
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.ATTRIBUTES.BY_TAG_ID, (req, res) => {
  const tagId = req.params.id;
  const sql = `SELECT * FROM attributes WHERE tagId = ?`;

  db.all(sql, tagId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (rows.length === 0) return res.status(404).json({ error: 'No attributes found for this tag' });
    res.json(rows || []);
  });
});

/**
 * Get attributes by name.
 * 
 * @name Get Attribute By Name
 * @route {GET} /attributes/name/:name
 * @param {express.Request} req - Express request object
 * @param {string} req.params.name - The name of the attribute
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.ATTRIBUTES.BY_NAME, (req, res) => {
  const name = req.params.name;
  const sql = `SELECT * FROM attributes WHERE attribute = ?`;

  db.all(sql, [name], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (rows.length === 0) return res.status(404).json({ error: 'No attributes found' });
    res.json(rows);
  });
});

export default router;
