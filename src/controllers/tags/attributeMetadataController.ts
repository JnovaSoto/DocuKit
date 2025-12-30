import attributeMetadataService from '../../services/tags/attributeMetadataService.js';
import { Request, Response } from 'express';

const attributeMetadataController = {
    /**
     * Get all attribute metadata.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    getAllMetadata: async (_req: Request, res: Response) => {
        try {
            const rows = await attributeMetadataService.getAllMetadata();
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get metadata by name.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    getMetadataByName: async (req: Request, res: Response) => {
        const name = req.params.name;
        try {
            const row = await attributeMetadataService.getMetadataByName(name);
            if (!row) return res.status(404).json({ error: 'Attribute metadata not found' });
            res.json(row);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Create attribute metadata.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    createMetadata: async (req: Request, res: Response) => {
        const { attributeName, generalDescription } = req.body;

        if (!attributeName || !generalDescription) {
            return res.status(400).json({ error: 'Missing required fields: attributeName and generalDescription' });
        }

        try {
            const id = await attributeMetadataService.createMetadata(attributeName, generalDescription);
            res.status(201).json({ id, attributeName, generalDescription });
        } catch (err: any) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Attribute metadata already exists' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

export default attributeMetadataController;
