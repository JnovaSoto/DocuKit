/**
 * Tag routes.
 * Handles CRUD operations for HTML tags.
 */

import express from 'express';
import db from '../db/database.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdminLevel1 } from '../middleware/auth.js';
import ROUTES from '../config/routes.js';

const router = express.Router();

/**
 * Get all tags.
 * @route GET /
 */
router.get(ROUTES.TAGS.BASE, (req, res) => {
  const sql = `SELECT * FROM tags`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


/**
 * Create a new tag (authenticated users only).
 * @route POST /create
 */
router.post(ROUTES.TAGS.CREATE, isAuthenticated, (req, res) => {
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
 * Get a tag by ID (authenticated users only).
 * @route GET /tagId/:id
 */
router.get(ROUTES.TAGS.BY_ID, isAuthenticated, (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM tags WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Tag not found' });
    res.json(row);
  });
});

/**
 * Get tags by IDs (comma-separated).
 * @route GET /tagIds/:ids
 */
router.get(ROUTES.TAGS.BY_IDS, isAuthenticated, (req, res) => {
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
 * @route GET /tagName/:name
 */
router.get(ROUTES.TAGS.BY_NAME, isAuthenticated, (req, res) => {
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
 * Update a tag and its attributes (admin only).
 * @route PUT /:id
 */
router.put('/:id', isAdminLevel1, (req, res) => {
  const id = req.params.id;
  const { tagName, usability, attributes } = req.body;

  if (!tagName || !usability) {
    return res.status(400).json({ error: 'Missing required fields: tagName and usability' });
  }

  // Update the tag
  const updateTagSql = `UPDATE tags SET tagName = ?, usability = ? WHERE id = ?`;

  db.run(updateTagSql, [tagName, usability, id], function (err) {
    if (err) {
      console.error('Error updating tag:', err.message);
      return res.status(500).json({ error: 'Failed to update tag: ' + err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    console.log(`Updated tag ${id}`);

    // If attributes are provided, update them
    if (attributes && Array.isArray(attributes)) {
      // Delete existing attributes for this tag
      const deleteAttrSql = `DELETE FROM attributes WHERE tag = ?`;

      db.run(deleteAttrSql, [id], function (err) {
        if (err) {
          console.error('Error deleting old attributes:', err.message);
          return res.status(500).json({ error: 'Failed to update attributes: ' + err.message });
        }

        console.log(`Deleted ${this.changes} old attribute(s) for tag ${id}`);

        // Insert new attributes
        if (attributes.length > 0) {
          const insertAttrSql = `INSERT INTO attributes (attribute, info, tag) VALUES (?, ?, ?)`;
          const stmt = db.prepare(insertAttrSql);

          for (const attr of attributes) {
            if (attr.attribute) { // Only insert if attribute name exists
              stmt.run([attr.attribute, attr.info || '', id]);
            }
          }

          stmt.finalize((err) => {
            if (err) {
              console.error('Error inserting new attributes:', err.message);
              return res.status(500).json({ error: 'Failed to insert new attributes: ' + err.message });
            }

            res.json({
              message: 'Tag and attributes updated successfully',
              id,
              tagName,
              usability
            });
          });
        } else {
          // No attributes to insert
          res.json({
            message: 'Tag updated successfully (no attributes)',
            id,
            tagName,
            usability
          });
        }
      });
    } else {
      // No attributes provided, just return success for tag update
      res.json({
        message: 'Tag updated successfully',
        id,
        tagName,
        usability
      });
    }
  });
});


/**
 * Delete a tag (admin only).
 * Deletes all related attributes first, then deletes the tag.
 * @route DELETE /delete/:id  
 */
router.delete(ROUTES.TAGS.DELETE, isAdminLevel1, (req, res) => {
  const id = req.params.id;

  // First, delete all attributes associated with this tag
  const deleteAttributesSql = `DELETE FROM attributes WHERE tag = ?`;

  db.run(deleteAttributesSql, [id], function (err) {
    if (err) {
      console.error('Error deleting attributes:', err.message);
      return res.status(500).json({ error: 'Failed to delete tag attributes: ' + err.message });
    }

    console.log(`Deleted ${this.changes} attribute(s) for tag ${id}`);

    // Now delete the tag itself
    const deleteTagSql = `DELETE FROM tags WHERE id = ?`;

    db.run(deleteTagSql, [id], function (err) {
      if (err) {
        console.error('Error deleting tag:', err.message);
        return res.status(500).json({ error: 'Failed to delete tag: ' + err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'The tag to remove was not found.' });
      }

      res.json({
        message: 'Tag and related attributes deleted successfully',
        deletedId: id
      });
    });
  });
});


export default router;
