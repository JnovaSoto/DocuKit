import attributeMetadataService from '../../services/tags/attributeMetadataService.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import { attributeMetadataSchema } from '../../schemas/attributeSchema.js';

const attributeMetadataController = {
    /**
     * Retrieve all attribute documentation metadata.
     * @param {Request} _req - The Express request object.
     * @param {Response} res - The Express response object.
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
     * Find documentation metadata for a specific attribute by name.
     * @param {Request} req - Request containing attribute name in params.
     * @param {Response} res - The Express response object.
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
     * Create a new documentation record for an attribute.
     * @param {Request} req - Request containing attributeName and generalDescription in body.
     * @param {Response} res - The Express response object.
     */
    createMetadata: async (req: Request, res: Response) => {
        try {
            const validatedData = attributeMetadataSchema.parse(req.body);
            const { attributeName, generalDescription } = validatedData;

            const id = await attributeMetadataService.createMetadata(attributeName, generalDescription);
            res.status(201).json({ id, attributeName, generalDescription });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Attribute metadata already exists' });
            }
            res.status(500).json({ error: err.message });
        }
    }

};

export default attributeMetadataController;
