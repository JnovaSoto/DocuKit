import express from 'express';
import db from '../db/database.js';
import { isAuthenticated, isAdminLevel1 } from '../middleware/auth.js';
import ROUTES from '../config/routes.js';

const router = express.Router();

router.get(ROUTES.PROPERTIES.BASE, (req, res) => {
    const sql = `SELECT * FROM properties`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post(ROUTES.PROPERTIES.CREATE, isAuthenticated, (req, res) => {
    const { propertyName, usability } = req.body;
    if (!propertyName || !usability) return res.status(400).json({ error: 'Missing fields' });

    const sql = `INSERT INTO properties (propertyName, usability) VALUES (?, ?)`;
    db.run(sql, [propertyName, usability], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, propertyName, usability });
    });
});

router.get(ROUTES.PROPERTIES.BY_ID, (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM properties WHERE id = ?`;

    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Property not found' });
        res.json(row);
    });
});

router.get(ROUTES.PROPERTIES.BY_IDS, (req, res) => {
    const idsParam = req.params.ids;
    if (!idsParam) return res.status(400).json({ error: 'No IDs received' });

    const ids = idsParam.split(',').map(id => Number(id.trim()));
    const placeholders = ids.map(() => '?').join(',');
    const sqlProperty = `SELECT * FROM properties WHERE id IN (${placeholders})`;

    db.all(sqlProperty, ids, (err, propertyRows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        if (propertyRows.length === 0) return res.status(404).json({ error: 'Property not found', propertyRows });
        res.json(propertyRows);
    });
});

router.get(ROUTES.PROPERTIES.BY_NAME, (req, res) => {
    const propertyName = req.params.name;
    const sql = `SELECT * FROM properties WHERE propertyName = ?`;

    db.all(sql, [propertyName.toLowerCase()], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });
        res.json(rows);
    });
});

/**
 * Update property and its attributes (admin only).
 * Deletes existing attributes and inserts new ones in a transaction-like manner.
 */
router.put('/:id', isAdminLevel1, (req, res) => {
    const id = req.params.id;
    const { propertyName, usability, attributes } = req.body;

    if (!propertyName || !usability) {
        return res.status(400).json({ error: 'Missing required fields: propertyName and usability' });
    }

    const updatePropertySql = `UPDATE properties SET propertyName = ?, usability = ? WHERE id = ?`;

    db.run(updatePropertySql, [propertyName, usability, id], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to update property: ' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Property not found' });

        if (attributes && Array.isArray(attributes)) {
            const deleteAttrSql = `DELETE FROM property_attributes WHERE propertyId = ?`;

            db.run(deleteAttrSql, [id], function (err) {
                if (err) return res.status(500).json({ error: 'Failed to update attributes: ' + err.message });

                if (attributes.length > 0) {
                    const insertAttrSql = `INSERT INTO property_attributes (attribute, info, propertyId) VALUES (?, ?, ?)`;
                    const stmt = db.prepare(insertAttrSql);

                    for (const attr of attributes) {
                        if (attr.attribute) {
                            stmt.run([attr.attribute, attr.info || '', id]);
                        }
                    }

                    stmt.finalize((err) => {
                        if (err) return res.status(500).json({ error: 'Failed to insert new attributes: ' + err.message });
                        res.json({ message: 'Property and attributes updated successfully', id, propertyName, usability });
                    });
                } else {
                    res.json({ message: 'Property updated successfully (no attributes)', id, propertyName, usability });
                }
            });
        } else {
            res.json({ message: 'Property updated successfully', id, propertyName, usability });
        }
    });
});

/**
 * Delete property and all related attributes (admin only).
 */
router.delete(ROUTES.PROPERTIES.DELETE, isAdminLevel1, (req, res) => {
    const id = req.params.id;
    const deleteAttributesSql = `DELETE FROM property_attributes WHERE propertyId = ?`;

    db.run(deleteAttributesSql, [id], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to delete property attributes: ' + err.message });

        const deletePropertySql = `DELETE FROM properties WHERE id = ?`;
        db.run(deletePropertySql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Failed to delete property: ' + err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'The property to remove was not found.' });

            res.json({ message: 'Property and related attributes deleted successfully', deletedId: id });
        });
    });
});

export default router;
