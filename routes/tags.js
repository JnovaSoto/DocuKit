import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Create tag
router.post('/', (req, res) => {
  const { tagName, usability } = req.body;

  console.log('Inserting tag:', tagName, usability);

  if (!tagName) return res.status(400).json({ error: 'tagName is obligatory' });
  if (!usability) return res.status(400).json({ error: 'usability is obligatory' });

  // SQL to insert a single tag
  const sql = `INSERT INTO tags (tagName, usability) VALUES (?, ?)`;

  db.run(sql, [tagName, usability], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability });
  });
});

// Create attributes (batch insert)
router.post('/attributes', (req, res) => {
  const { tagId, attributes } = req.body;

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

// Get tags
router.get('/', (req, res) => {
  // SQL to get all tags
  const sql = `SELECT * FROM tags`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get attributes
router.get('/attributes', (req, res) => {
  // SQL to get all attributes
  const sql = `SELECT * FROM attributes`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete tag
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  // SQL to delete a single tag
  const sql = `DELETE FROM tags WHERE id = ?`;

  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ message: 'The tag to remove was not found.' });
    }

    res.json({ message: 'Tag deleted', deletedId: id });
  });
});

export default router;
