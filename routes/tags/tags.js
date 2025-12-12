import express from 'express';
import db from '../../db/database.js';
import { isAuthenticated, isAdminLevel1 } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';

const router = express.Router();

/**
 * Get all tags.
 * 
 * @name Get All Tags
 * @route {GET} /tags
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.TAGS.BASE, (req, res) => {
  const sql = `SELECT * FROM tags`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * Create a new tag (Authenticated users).
 * 
 * @name Create Tag
 * @route {POST} /tags/create
 * @param {Object} req.body - The request body
 * @param {string} req.body.tagName - The name of the tag
 * @param {string} req.body.usability - How the tag is used
 * @param {string} [req.body.content] - Tag content description
 * @param {express.Response} res - Express response object
 */
router.post(ROUTES.TAGS.CREATE, isAuthenticated, (req, res) => {
  const { tagName, usability, content } = req.body;
  if (!tagName || !usability) return res.status(400).json({ error: 'Missing fields' });

  const sql = `INSERT INTO tags (tagName, usability, content) VALUES (?, ?, ?)`;
  db.run(sql, [tagName, usability, content || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability, content });
  });
});

/**
 * Get a tag by ID.
 * 
 * @name Get Tag By ID
 * @route {GET} /tags/:id
 * @param {express.Request} req - Express request object
 * @param {string} req.params.id - The ID of the tag
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.TAGS.BY_ID, (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM tags WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Tag not found' });
    res.json(row);
  });
});

/**
 * Get multiple tags by a comma-separated list of IDs.
 * 
 * @name Get Tags By IDs
 * @route {GET} /tags/by-ids/:ids
 * @param {express.Request} req - Express request object
 * @param {string} req.params.ids - Comma-separated list of tag IDs
 * @param {express.Response} res - Express response object
 */
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

/**
 * Get a tag by name.
 * 
 * @name Get Tag By Name
 * @route {GET} /tags/name/:name
 * @param {express.Request} req - Express request object
 * @param {string} req.params.name - The name of the tag
 * @param {express.Response} res - Express response object
 */
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
 * Update tag and its attributes (Admin only).
 * Deletes existing attributes and inserts new ones in a transaction-like manner.
 * 
 * @name Update Tag
 * @route {PUT} /tags/:id
 * @param {express.Request} req - Express request object
 * @param {string} req.params.id - The ID of the tag to update
 * @param {string} req.body.tagName - New tag name
 * @param {string} req.body.usability - New usability description
 * @param {Array} req.body.attributes - Array of attributes to adding
 * @param {express.Response} res - Express response object
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
 * Delete tag and all related attributes (Admin only).
 * 
 * @name Delete Tag
 * @route {DELETE} /tags/delete/:id
 * @param {express.Request} req - Express request object
 * @param {string} req.params.id - The ID of the tag to delete
 * @param {express.Response} res - Express response object
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
