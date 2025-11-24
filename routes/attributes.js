import express from 'express';
import db from '../db/database.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdminLevel1 } from '../middleware/auth.js';
const router = express.Router();

// Get attributes
router.get('/attributes', (req, res) => {
  // SQL to get all attributes
  const sql = `SELECT * FROM attributes`;

    console.log("Getting the attributes")

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create attributes (batch insert)
router.post('/attributes/create',isAuthenticated, (req, res) => {
  const { tagId, attributes } = req.body;

   console.log(
  'Inserting attributes:', 
  tagId, 
  attributes, 
  );

  if (!Array.isArray(attributes)) {
    return res.status(400).json({ error: 'attributes must be an array.' });
  }

  // SQL to insert multiple attributes
  const sql = `INSERT INTO attributes (attribute, info, tag) VALUES (?, ?, ?)`;
  const stmt = db.prepare(sql);

  for (const attr of attributes) {
    if (!attr.attribute) continue; // Avoid NOT NULL errors
    stmt.run([attr.attribute, attr.info, tagId]);
  }

  stmt.finalize(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Attributes added successfully' });
  });
});

// Get attribute by tag id
router.get('/attributes/idAttribute/:id', isAuthenticated, (req, res) => {
  const tagId = req.params.id;

  console.log("Getting attributes for tag id", tagId);

  const sql = `SELECT * FROM attributes WHERE tag = ?`;

  db.all(sql, tagId, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No attributes found for this tag' });
    }

     res.json(rows || []); 
  });
});

// Get attribute by name
router.get('/attribute/attributeName/:name', isAuthenticated, (req, res) => {
  const name = req.params.name;

  console.log("Getting attribute by name", name);

  const sql = `SELECT * FROM attributes WHERE attribute = ?`;

  db.all(sql, [name], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No attributes found' });
    }

    res.json(rows)
  });
});


export default router;
