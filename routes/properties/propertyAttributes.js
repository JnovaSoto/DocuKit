import express from 'express';
import db from '../../db/database.js';
import { isAuthenticated } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';

const router = express.Router();

/**
 * Get all property attributes.
 * 
 * @name Get All Property Attributes
 * @route {GET} /property-attributes
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.PROPERTY_ATTRIBUTES.BASE, (req, res) => {
    const sql = `SELECT * FROM property_attributes`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * Create a new property attribute (Authenticated users).
 * 
 * @name Create Property Attribute
 * @route {POST} /property-attributes/create
 * @param {Object} req.body - The request body
 * @param {number} req.body.propertyId - The ID of the associated property
 * @param {Array<Object>} req.body.attributes - Array of attribute objects
 * @param {express.Response} res - Express response object
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
 * 
 * @name Get Attributes By Property ID
 * @route {GET} /property-attributes/property/:id
 * @param {express.Request} req - Express request object
 * @param {string} req.params.id - The ID of the property
 * @param {express.Response} res - Express response object
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
 * 
 * @name Get Property Attribute By Name
 * @route {GET} /property-attributes/name/:name
 * @param {express.Request} req - Express request object
 * @param {string} req.params.name - The name of the attribute
 * @param {express.Response} res - Express response object
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
