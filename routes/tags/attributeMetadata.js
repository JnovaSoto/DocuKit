import express from 'express';
import db from '../../db/database.js';
import { isAdminLevel1 } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';

const router = express.Router();

/**
 * Get all attribute metadata
 */
/**
 * Get all attribute metadata.
 * 
 * @name Get All Attribute Metadata
 * @route {GET} /attribute-metadata
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.ATTRIBUTE_METADATA.BASE, (req, res) => {
    const sql = `SELECT * FROM attribute_metadata ORDER BY attributeName ASC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * Get attribute metadata by name
 */
/**
 * Get attribute metadata by name.
 * 
 * @name Get Attribute Metadata By Name
 * @route {GET} /attribute-metadata/:name
 * @param {express.Request} req - Express request object
 * @param {string} req.params.name - The name of the attribute
 * @param {express.Response} res - Express response object
 */
router.get(ROUTES.ATTRIBUTE_METADATA.BY_NAME, (req, res) => {
    const name = req.params.name;
    const sql = `SELECT * FROM attribute_metadata WHERE attributeName = ?`;

    db.get(sql, [name], (err, row) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        if (!row) return res.status(404).json({ error: 'Attribute metadata not found' });
        res.json(row);
    });
});

/**
 * Create new attribute metadata (admin only)
 */
/**
 * Create new attribute metadata (Admin only).
 * 
 * @name Create Attribute Metadata
 * @route {POST} /attribute-metadata/create
 * @param {express.Request} req - Express request object
 * @param {string} req.body.attributeName - The name of the attribute
 * @param {string} req.body.generalDescription - A description of the attribute
 * @param {express.Response} res - Express response object
 */
router.post(ROUTES.ATTRIBUTE_METADATA.CREATE, isAdminLevel1, (req, res) => {
    const { attributeName, generalDescription } = req.body;

    if (!attributeName || !generalDescription) {
        return res.status(400).json({ error: 'Missing required fields: attributeName and generalDescription' });
    }

    const sql = `INSERT INTO attribute_metadata (attributeName, generalDescription) VALUES (?, ?)`;

    db.run(sql, [attributeName, generalDescription], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Attribute metadata already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, attributeName, generalDescription });
    });
});

export default router;
