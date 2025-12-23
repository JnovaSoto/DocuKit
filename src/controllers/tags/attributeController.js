import attributeService from '../../services/tags/attributeService.js';

const attributeController = {
    /**
     * Get all attributes.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getAllAttributes: async (req, res) => {
        try {
            const attributes = await attributeService.getAllAttributes();
            res.json(attributes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Create attributes for a tag.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    createAttributes: async (req, res) => {
        const { tagId, attributes } = req.body;

        if (!Array.isArray(attributes)) {
            return res.status(400).json({ error: 'attributes must be an array.' });
        }

        try {
            await attributeService.createAttributes(tagId, attributes);
            res.status(201).json({ message: 'Attributes added successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get attributes by tag ID.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getAttributesByTagId: async (req, res) => {
        const tagId = req.params.id;
        try {
            const rows = await attributeService.getAttributesByTagId(tagId);
            if (rows.length === 0) return res.status(404).json({ error: 'No attributes found for this tag' });
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Get attributes by name.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getAttributesByName: async (req, res) => {
        const name = req.params.name;
        try {
            const rows = await attributeService.getAttributesByName(name);
            if (rows.length === 0) return res.status(404).json({ error: 'No attributes found' });
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

export default attributeController;
