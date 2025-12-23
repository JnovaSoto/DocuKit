import propertyService from '../../services/properties/propertyService.js';
import validator from 'validator';

const propertyController = {
    /**
     * Get all properties.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getAllProperties: async (req, res) => {
        try {
            const properties = await propertyService.getAllProperties();
            res.json(properties);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Create a new property.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    createProperty: async (req, res) => {
        let { propertyName, usability, content } = req.body;

        // Sanitize input
        if (propertyName) propertyName = validator.escape(validator.trim(propertyName));
        if (usability) usability = validator.escape(validator.trim(usability));
        if (content) content = validator.escape(validator.trim(content));

        if (!propertyName || !usability) return res.status(400).json({ error: 'Missing fields' });

        try {
            const id = await propertyService.createProperty(propertyName, usability, content);
            res.status(201).json({ id, propertyName, usability, content });
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Property name already exists' });
            }
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get a property by ID.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getPropertyById: async (req, res) => {
        const id = req.params.id;
        try {
            const row = await propertyService.getPropertyById(id);
            if (!row) return res.status(404).json({ error: 'Property not found' });
            res.json(row);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get properties by multiple IDs.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getPropertiesByIds: async (req, res) => {
        const idsParam = req.params.ids;
        if (!idsParam) return res.status(400).json({ error: 'No IDs received' });

        try {
            const ids = idsParam.split(',').map(id => Number(id.trim()));
            const propertyRows = await propertyService.getPropertiesByIds(ids);
            if (propertyRows.length === 0) return res.status(404).json({ error: 'Property not found', propertyRows });
            res.json(propertyRows);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Get a property by name.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getPropertyByName: async (req, res) => {
        const propertyName = req.params.name;
        try {
            const rows = await propertyService.getPropertyByName(propertyName);
            if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Update a property.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    updateProperty: async (req, res) => {
        const id = req.params.id;
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
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Delete a property.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    deleteProperty: async (req, res) => {
        const id = req.params.id;
        try {
            const success = await propertyService.deleteProperty(id);
            if (!success) return res.status(404).json({ message: 'The property to remove was not found.' });
            res.json({ message: 'Property and related attributes deleted successfully', deletedId: id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

export default propertyController;
