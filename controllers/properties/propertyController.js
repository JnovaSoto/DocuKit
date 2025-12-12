import propertyService from '../../services/properties/propertyService.js';

const propertyController = {
    getAllProperties: async (req, res) => {
        try {
            const properties = await propertyService.getAllProperties();
            res.json(properties);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createProperty: async (req, res) => {
        const { propertyName, usability, content } = req.body;
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

    updateProperty: async (req, res) => {
        const id = req.params.id;
        const { propertyName, usability, attributes } = req.body;

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
