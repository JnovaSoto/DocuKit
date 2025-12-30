import propertyService from '../../services/properties/propertyService.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import { propertySchema, updatePropertySchema } from '../../schemas/propertySchema.js';

const propertyController = {
    /**
     * Retrieve all available CSS properties documentation.
     * @param {Request} _req - The Express request object.
     * @param {Response} res - The Express response object.
     */
    getAllProperties: async (_req: Request, res: Response) => {
        try {
            const properties = await propertyService.getAllProperties();
            res.json(properties);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Create a new CSS property entry in the database.
     * @param {Request} req - Request with propertyName, usability, and optional content.
     * @param {Response} res - The Express response object.
     */
    createProperty: async (req: Request, res: Response) => {
        try {
            const validatedData = propertySchema.parse(req.body);
            const { propertyName, usability, content } = validatedData;

            const id = await propertyService.createProperty(propertyName, usability, content || '');
            res.status(201).json({ id, propertyName, usability, content });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Property name already exists' });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Find a specific CSS property by its primary key.
     * @param {Request} req - Request containing the property ID in params.
     * @param {Response} res - The Express response object.
     */
    getPropertyById: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const row = await propertyService.getPropertyById(id);
            if (!row) return res.status(404).json({ error: 'Property not found' });
            res.json(row);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Retrieve details for multiple CSS properties by a comma-separated list of IDs.
     * @param {Request} req - Request containing 'ids' in params.
     * @param {Response} res - The Express response object.
     */
    getPropertiesByIds: async (req: Request, res: Response) => {
        const idsParam = req.params.ids;
        if (!idsParam) return res.status(400).json({ error: 'No IDs received' });

        try {
            const ids = idsParam.split(',').map(id => Number(id.trim()));
            const propertyRows = await propertyService.getPropertiesByIds(ids);
            if (propertyRows.length === 0) return res.status(404).json({ error: 'Property not found', propertyRows });
            res.json(propertyRows);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Find CSS properties by their name.
     * @param {Request} req - Request containing the property name in params.
     * @param {Response} res - The Express response object.
     */
    getPropertyByName: async (req: Request, res: Response) => {
        const propertyName = req.params.name;
        try {
            const rows = await propertyService.getPropertyByName(propertyName);
            if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Update an existing CSS property's data and its associated attributes.
     * @param {Request} req - Request with property ID in params and update data in body.
     * @param {Response} res - The Express response object.
     */
    updateProperty: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        try {
            const validatedData = updatePropertySchema.parse(req.body);
            const { propertyName, usability, attributes } = validatedData;

            const success = await propertyService.updateProperty(id, propertyName, usability, attributes || []);
            if (!success) return res.status(404).json({ error: 'Property not found' });

            res.json({
                message: attributes && attributes.length > 0
                    ? 'Property and attributes updated successfully'
                    : 'Property updated successfully (no attributes)',
                id,
                propertyName,
                usability
            });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Permanently remove a CSS property and its related attributes.
     * @param {Request} req - Request containing the property ID in params.
     * @param {Response} res - The Express response object.
     */
    deleteProperty: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await propertyService.deleteProperty(id);
            if (!success) return res.status(404).json({ message: 'The property to remove was not found.' });
            res.json({ message: 'Property and related attributes deleted successfully', deletedId: id });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

};

export default propertyController;
