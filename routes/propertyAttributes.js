import express from 'express';
import db from '../db/database.js';
import { isAuthenticated } from '../middleware/auth.js';
import ROUTES from '../config/routes.js';

const router = express.Router();

router.get(ROUTES.PROPERTY_ATTRIBUTES.BASE, (req, res) => {
    const sql = `SELECT * FROM property_attributes`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post(ROUTES.PROPERTY_ATTRIBUTES.CREATE, isAuthenticated, (req, res) => {
    const { attribute, info, propertyId } = req.body;
    if (!attribute || !propertyId) return res.status(400).json({ error: 'Missing fields' });

    const sql = `INSERT INTO property_attributes (attribute, info, propertyId) VALUES (?, ?, ?)`;
    db.run(sql, [attribute, info || '', propertyId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, attribute, info, propertyId });
    });
});

router.get(ROUTES.PROPERTY_ATTRIBUTES.BY_PROPERTY_ID, (req, res) => {
    const propertyId = req.params.id;
    const sql = `SELECT * FROM property_attributes WHERE propertyId = ?`;

    db.all(sql, [propertyId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        res.json(rows);
    });
});

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
