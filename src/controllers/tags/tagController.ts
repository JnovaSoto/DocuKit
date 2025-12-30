import tagService from '../../services/tags/tagService.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import { tagSchema, updateTagSchema } from '../../schemas/tagSchema.js';

const tagController = {
    /**
     * Retrieve all available tags.
     * @param {Request} _req - The Express request object.
     * @param {Response} res - The Express response object.
     */
    getAllTags: async (_req: Request, res: Response) => {
        try {
            const tags = await tagService.getAllTags();
            res.json(tags);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Create a new tag entry with description and optional content.
     * @param {Request} req - Request containing tagName, usability, and optional content in the body.
     * @param {Response} res - The Express response object.
     */
    createTag: async (req: Request, res: Response) => {
        try {
            const validatedData = tagSchema.parse(req.body);
            const { tagName, usability, content } = validatedData;

            const id = await tagService.createTag(tagName, usability, content || '');
            res.status(201).json({ id, tagName, usability, content });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Find a specific tag by its primary key.
     * @param {Request} req - Request containing the tag ID in params.
     * @param {Response} res - The Express response object.
     */
    getTagById: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const tag = await tagService.getTagById(id);
            if (!tag) return res.status(404).json({ error: 'Tag not found' });
            res.json(tag);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Retrieve details for multiple tags by a comma-separated list of IDs.
     * @param {Request} req - Request containing 'ids' in params (e.g., '1,2,3').
     * @param {Response} res - The Express response object.
     */
    getTagsByIds: async (req: Request, res: Response) => {
        const idsParam = req.params.ids;
        if (!idsParam) return res.status(400).json({ error: 'No IDs received' });

        try {
            const ids = idsParam.split(',').map(id => Number(id.trim()));
            const tagRows = await tagService.getTagsByIds(ids);
            if (tagRows.length === 0) return res.status(404).json({ error: 'Tag not found', tagRows });
            res.json(tagRows);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Find tags that match a specific name.
     * @param {Request} req - Request containing 'name' in params.
     * @param {Response} res - The Express response object.
     */
    getTagByName: async (req: Request, res: Response) => {
        const tagName = req.params.name;
        try {
            const rows = await tagService.getTagByName(tagName);
            if (rows.length === 0) return res.status(404).json({ error: 'Tag not found' });
            res.json(rows);
        } catch (err: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Update an existing tag's metadata and its related attributes.
     * @param {Request} req - Request with tag ID in params and updated data in body.
     * @param {Response} res - The Express response object.
     */
    updateTag: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        try {
            const validatedData = updateTagSchema.parse(req.body);
            const { tagName, usability, attributes } = validatedData;

            const success = await tagService.updateTag(id, tagName, usability, attributes || []);
            if (!success) return res.status(404).json({ error: 'Tag not found' });

            res.json({
                message: attributes && attributes.length > 0
                    ? 'Tag and attributes updated successfully'
                    : 'Tag updated successfully',
                id,
                tagName,
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
     * Permantently remove a tag and its associated attributes.
     * @param {Request} req - Request containing the tag ID in params.
     * @param {Response} res - The Express response object.
     */
    deleteTag: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await tagService.deleteTag(id);
            if (!success) return res.status(404).json({ message: 'The tag to remove was not found.' });
            res.json({ message: 'Tag and related attributes deleted successfully', deletedId: id });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

};

export default tagController;
