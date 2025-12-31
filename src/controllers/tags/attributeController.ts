import attributeService from '../../services/tags/attributeService.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import { attributeSchema } from '../../schemas/attributeSchema.js';

const attributeController = {
    /**
     * Get all attributes.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    getAllAttributes: async (_req: Request, res: Response) => {
        try {
            const attributes = await attributeService.getAllAttributes();
            res.json(attributes);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Create attributes for a tag.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    createAttributes: async (req: Request, res: Response) => {
        try {
            const validatedData = attributeSchema.parse(req.body);
            const { tagId, attributes } = validatedData;

            await attributeService.createAttributes(tagId, attributes);
            res.status(201).json({ message: 'Attributes added successfully' });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get attributes by tag ID.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    getAttributesByTagId: async (req: Request, res: Response) => {
        const tagId = parseInt(req.params.id);
        try {
            const rows = await attributeService.getAttributesByTagId(tagId);
            if (rows.length === 0) return res.status(404).json({ error: 'No attributes found for this tag' });
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Get attributes by name.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    getAttributesByName: async (req: Request, res: Response) => {
        const name = req.params.name;
        try {
            const rows = await attributeService.getAttributesByName(name);
            if (rows.length === 0) return res.status(404).json({ error: 'No attributes found' });
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

export default attributeController;
