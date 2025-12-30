import propertyService from '../../services/properties/propertyService.js';
import validator from 'validator';
import { Request, Response } from 'express';

const propertyController = {
    /**
     * Get all properties.  
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Create a new property.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    createProperty: async (req: Request, res: Response) => {
        let { propertyName, usability, content } = req.body;

        // Sanitize input
        if (propertyName) propertyName = validator.escape(validator.trim(propertyName));
        if (usability) usability = validator.escape(validator.trim(usability));
        if (content) content = validator.escape(validator.trim(content));

        if (!propertyName || !usability) return res.status(400).json({ error: 'Missing fields' });

        try {
            const id = await propertyService.createProperty(propertyName, usability, content);
            res.status(201).json({ id, propertyName, usability, content });
        } catch (err: any) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Property name already exists' });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get a property by ID.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Get properties by multiple IDs.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Get a property by name.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Update a property.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    updateProperty: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        let { propertyName, usability, attributes } = req.body;

        // Sanitize input
        if (propertyName) propertyName = validator.escape(validator.trim(propertyName));
        if (usability) usability = validator.escape(validator.trim(usability));
        if (attributes && Array.isArray(attributes)) {
            attributes = attributes.map(attr => ({
                attribute: attr.attribute ? validator.escape(validator.trim(attr.attribute)) : '',
                info: attr.info ? validator.escape(validator.trim(attr.info)) : ''
            }));
        }

        if (!propertyName || !usability) {
            return res.status(400).json({ error: 'Missing required fields: propertyName and usability' });
        }

        try {
            const success = await propertyService.updateProperty(id, propertyName, usability, attributes);
            if (!success) return res.status(404).json({ error: 'Property not found' });

            if (attributes && attributes.length > 0) {
                res.json({ message: 'Property and attributes updated successfully', id, propertyName, usability });
            } else {
                res.json({ message: 'Property updated successfully (no attributes)', id, propertyName, usability });
            }
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Delete a property.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
