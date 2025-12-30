import tagService from '../../services/tags/tagService.js';
import validator from 'validator';
import { Request, Response } from 'express';

const tagController = {
    /**
     * Get all tags.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Create a new tag.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    createTag: async (req: Request, res: Response) => {
        let { tagName, usability, content } = req.body;

        // Sanitize input
        if (tagName) tagName = validator.escape(validator.trim(tagName));
        if (usability) usability = validator.escape(validator.trim(usability));
        if (content) content = validator.escape(validator.trim(content));

        if (!tagName || !usability) return res.status(400).json({ error: 'Missing fields' });

        try {
            const id = await tagService.createTag(tagName, usability, content);
            res.status(201).json({ id, tagName, usability, content });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get a tag by ID.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Get tags by multiple IDs.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Get a tag by name.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
     * Update a tag.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    updateTag: async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        let { tagName, usability, attributes } = req.body;

        // Sanitize input
        if (tagName) tagName = validator.escape(validator.trim(tagName));
        if (usability) usability = validator.escape(validator.trim(usability));
        if (attributes && Array.isArray(attributes)) {
            attributes = attributes.map(attr => ({
                attribute: attr.attribute ? validator.escape(validator.trim(attr.attribute)) : '',
                info: attr.info ? validator.escape(validator.trim(attr.info)) : ''
            }));
        }

        if (!tagName || !usability) {
            return res.status(400).json({ error: 'Missing required fields: tagName and usability' });
        }

        try {
            const success = await tagService.updateTag(id, tagName, usability, attributes);
            if (!success) return res.status(404).json({ error: 'Tag not found' });

            if (attributes && attributes.length > 0) {
                res.json({ message: 'Tag and attributes updated successfully', id, tagName, usability });
            } else {
                res.json({ message: 'Tag updated successfully', id, tagName, usability });
            }
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Delete a tag.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
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
