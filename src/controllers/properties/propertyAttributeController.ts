import propertyAttributeService from '../../services/properties/propertyAttributeService.js';
import { Request, Response } from 'express';

const propertyAttributeController = {
    /**
     * Retrieve all CSS property attributes defined in the system.
     * @param {Request} _req - The Express request object.
     * @param {Response} res - The Express response object.
     */
    getAllAttributes: async (_req: Request, res: Response) => {
        try {
            const rows = await propertyAttributeService.getAllAttributes();
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Create multiple attribute records for a specified CSS property.
     * @param {Request} req - Request with propertyId and attributes array in body.
     * @param {Response} res - The Express response object.
     */
    createAttributes: async (req: Request, res: Response) => {
        const { propertyId, attributes } = req.body;

        if (!Array.isArray(attributes)) {
            return res.status(400).json({ error: 'attributes must be an array.' });
        }

        try {
            await propertyAttributeService.createAttributes(propertyId, attributes);
            res.status(201).json({ message: 'Property attributes added successfully' });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Retrieve all attributes associated with a specific CSS property by its ID.
     * @param {Request} req - Request containing the property ID in params.
     * @param {Response} res - The Express response object.
     */
    getAttributesByPropertyId: async (req: Request, res: Response) => {
        const propertyId = parseInt(req.params.id);
        try {
            const rows = await propertyAttributeService.getAttributesByPropertyId(propertyId);
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Find CSS property attributes by their key name (e.g., 'font-family').
     * @param {Request} req - Request containing the attribute name in params.
     * @param {Response} res - The Express response object.
     */
    getAttributesByName: async (req: Request, res: Response) => {
        const attributeName = req.params.name;
        try {
            const rows = await propertyAttributeService.getAttributesByName(attributeName);
            if (rows.length === 0) return res.status(404).json({ error: 'Attribute not found' });
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

};

export default propertyAttributeController;
