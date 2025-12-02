import express from 'express';
import db from '../db/database.js';
import { isAuthenticated, isAdminLevel1 } from '../middleware/auth.js';
import ROUTES from '../config/routes.js';

const router = express.Router();

router.get(ROUTES.TAGS.BASE, (req, res) => {
  const sql = `SELECT * FROM tags`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post(ROUTES.TAGS.CREATE, isAuthenticated, (req, res) => {
  const { tagName, usability } = req.body;
  if (!tagName || !usability) return res.status(400).json({ error: 'Missing fields' });

  const sql = `INSERT INTO tags (tagName, usability) VALUES (?, ?)`;
  db.run(sql, [tagName, usability], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability });
  });
});

router.get(ROUTES.TAGS.BY_ID, (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM tags WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Tag not found' });
    res.json(row);
  });
});

router.get(ROUTES.TAGS.BY_IDS, (req, res) => {
  const idsParam = req.params.ids;
  if (!idsParam) return res.status(400).json({ error: 'No IDs received' });

  const ids = idsParam.split(',').map(id => Number(id.trim()));
  const placeholders = ids.map(() => '?').join(',');
  const sqlTag = `SELECT * FROM Tags WHERE id IN (${placeholders})`;

  db.all(sqlTag, ids, (err, tagRows) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (tagRows.length === 0) return res.status(404).json({ error: 'Tag not found', tagRows });
    res.json(tagRows);
  });
});

router.get(ROUTES.TAGS.BY_NAME, (req, res) => {
  const tagName = req.params.name;
  const sql = `SELECT * FROM tags WHERE tagName = ?`;

  db.all(sql, [tagName.toLowerCase()], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (rows.length === 0) return res.status(404).json({ error: 'Tag not found' });
    res.json(rows);
  });
});

/**
 * Update tag and its attributes (admin only).
 * Deletes existing attributes and inserts new ones in a transaction-like manner.
 */
router.put('/:id', isAdminLevel1, (req, res) => {
  const id = req.params.id;
  const { tagName, usability, attributes } = req.body;

  if (!tagName || !usability) {
    return res.status(400).json({ error: 'Missing required fields: tagName and usability' });
  }

  const updateTagSql = `UPDATE tags SET tagName = ?, usability = ? WHERE id = ?`;

  db.run(updateTagSql, [tagName, usability, id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update tag: ' + err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Tag not found' });

    if (attributes && Array.isArray(attributes)) {
      const deleteAttrSql = `DELETE FROM attributes WHERE tagId = ?`;

      db.run(deleteAttrSql, [id], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to update attributes: ' + err.message });

        if (attributes.length > 0) {
          const insertAttrSql = `INSERT INTO attributes (attribute, info, tagId) VALUES (?, ?, ?)`;
          const stmt = db.prepare(insertAttrSql);

          for (const attr of attributes) {
            if (attr.attribute) {
              stmt.run([attr.attribute, attr.info || '', id]);
            }
          }

          stmt.finalize((err) => {
            if (err) return res.status(500).json({ error: 'Failed to insert new attributes: ' + err.message });
            res.json({ message: 'Tag and attributes updated successfully', id, tagName, usability });
          });
        } else {
          res.json({ message: 'Tag updated successfully (no attributes)', id, tagName, usability });
        }
      });
    } else {
      res.json({ message: 'Tag updated successfully', id, tagName, usability });
    }
  });
});

/**
 * Delete tag and all related attributes (admin only).
 */
router.delete(ROUTES.TAGS.DELETE, isAdminLevel1, (req, res) => {
  const id = req.params.id;
  const deleteAttributesSql = `DELETE FROM attributes WHERE tagId = ?`;

  db.run(deleteAttributesSql, [id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete tag attributes: ' + err.message });

    const deleteTagSql = `DELETE FROM tags WHERE id = ?`;
    db.run(deleteTagSql, [id], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to delete tag: ' + err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'The tag to remove was not found.' });

      res.json({ message: 'Tag and related attributes deleted successfully', deletedId: id });
    });
  });
});

export default router;
