import express from 'express';
import db from '../../db/database.js';
import { isAuthenticated } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';

const router = express.Router();

/**
 * Get all property attributes.
 */
router.get(ROUTES.PROPERTY_ATTRIBUTES.BASE, (req, res) => {
    const sql = `SELECT * FROM property_attributes`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * Create a new property attribute.
 */
router.post(ROUTES.PROPERTY_ATTRIBUTES.CREATE, isAuthenticated, (req, res) => {
    const { propertyId, attributes } = req.body;

    if (!Array.isArray(attributes)) {
        return res.status(400).json({ error: 'attributes must be an array.' });
    }

    const sql = `INSERT INTO property_attributes (attribute, info, propertyId) VALUES (?, ?, ?)`;
    const stmt = db.prepare(sql);

    for (const attr of attributes) {
        if (!attr.attribute) continue;
        stmt.run([attr.attribute, attr.info, propertyId]);
    }

    stmt.finalize(err => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Property attributes added successfully' });
    });
});

/**
 * Get all property attributes by property ID.
 */
router.get(ROUTES.PROPERTY_ATTRIBUTES.BY_PROPERTY_ID, (req, res) => {
    const propertyId = req.params.id;
    const sql = `SELECT * FROM property_attributes WHERE propertyId = ?`;

    db.all(sql, [propertyId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        res.json(rows);
    });
});

/**
 * Get a property attribute by name.
 */
router.get(ROUTES.PROPERTY_ATTRIBUTES.BY_NAME, (req, res) => {
    const attributeName = req.params.name;
    const sql = `SELECT * FROM property_attributes WHERE attribute = ?`;

    db.all(sql, [attributeName], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        if (rows.length === 0) return res.status(404).json({ error: 'Attribute not found' });
        res.json(rows);
    });
});

export default router;
