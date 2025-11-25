/**
 * Tag routes.
 * Handles CRUD operations for HTML tags.
 */

import express from 'express';
import db from '../db/database.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdminLevel1 } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get all tags.
 * @route GET /tags
 */
router.get('/', (req, res) => {
  const sql = `SELECT * FROM tags`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


/**
 * Create a new tag (authenticated users only).
 * @route POST /tags
 */
router.post('/', isAuthenticated, (req, res) => {
  const { tagName, usability } = req.body;

  if (!tagName || !usability) return res.status(400).json({ error: 'Missing fields' });

  // SQL to insert a single tag
  const sql = `INSERT INTO tags (tagName, usability) VALUES (?, ?)`;

  db.run(sql, [tagName, usability], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability });
  });
});


/**
 * Get tags by IDs (comma-separated).
 * @route GET /tags/idTag/:ids
 */
router.get('/idTag/:ids', isAuthenticated, (req, res) => {
  const idsParam = req.params.ids;
  if (!idsParam) {
    return res.status(400).json({ error: 'No IDs received' });
  }
  const ids = idsParam.split(',').map(id => Number(id.trim()));
  const placeholders = ids.map(() => '?').join(',');
  const sqlTag = `SELECT * FROM Tags WHERE id IN (${placeholders})`;

  db.all(sqlTag, ids, (err, tagRows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (tagRows.length === 0) {
      return res.status(404).json({ error: 'Tag not found', tagRows });
    }
    res.json(tagRows);
  });

})

/**
 * Get tag by name.
 * @route GET /tags/tagName/:name
 */
router.get('/tagName/:name', isAuthenticated, (req, res) => {
  const tagName = req.params.name;

  const sql = `SELECT * FROM tags WHERE tagName = ?`;

  db.all(sql, [tagName.toLowerCase()], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(rows);
  });
});


/**
 * Delete a tag (admin only).
 * @route DELETE /tags/:id
 */
router.delete('/:id', isAdminLevel1, (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM tags WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ message: 'The tag to remove was not found.' });
    }

    res.json({ message: 'Tag deleted', deletedId: id });
  });
});


export default router;
