import propertyAttributeService from '../../services/properties/propertyAttributeService.js';

const propertyAttributeController = {
    /**
     * Get all property attributes.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getAllAttributes: async (req, res) => {
        try {
            const rows = await propertyAttributeService.getAllAttributes();
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Create property attributes.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    createAttributes: async (req, res) => {
        const { propertyId, attributes } = req.body;

        if (!Array.isArray(attributes)) {
            return res.status(400).json({ error: 'attributes must be an array.' });
        }

        try {
            await propertyAttributeService.createAttributes(propertyId, attributes);
            res.status(201).json({ message: 'Property attributes added successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get attributes by property ID.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getAttributesByPropertyId: async (req, res) => {
        const propertyId = req.params.id;
        try {
            const rows = await propertyAttributeService.getAttributesByPropertyId(propertyId);
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
