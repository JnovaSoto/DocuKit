import attributeMetadataService from '../../services/tags/attributeMetadataService.js';

const attributeMetadataController = {
    getAllMetadata: async (req, res) => {
        try {
            const rows = await attributeMetadataService.getAllMetadata();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getMetadataByName: async (req, res) => {
        const name = req.params.name;
        try {
            const row = await attributeMetadataService.getMetadataByName(name);
            if (!row) return res.status(404).json({ error: 'Attribute metadata not found' });
            res.json(row);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createMetadata: async (req, res) => {
        const { attributeName, generalDescription } = req.body;

        if (!attributeName || !generalDescription) {
            return res.status(400).json({ error: 'Missing required fields: attributeName and generalDescription' });
        }

        try {
            const id = await attributeMetadataService.createMetadata(attributeName, generalDescription);
            res.status(201).json({ id, attributeName, generalDescription });
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Attribute metadata already exists' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

export default attributeMetadataController;
