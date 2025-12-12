import tagService from '../../services/tags/tagService.js';

const tagController = {
    getAllTags: async (req, res) => {
        try {
            const tags = await tagService.getAllTags();
            res.json(tags);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createTag: async (req, res) => {
        const { tagName, usability, content } = req.body;
        if (!tagName || !usability) return res.status(400).json({ error: 'Missing fields' });

        try {
            const id = await tagService.createTag(tagName, usability, content);
            res.status(201).json({ id, tagName, usability, content });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getTagById: async (req, res) => {
        const id = req.params.id;
        try {
            const tag = await tagService.getTagById(id);
            if (!tag) return res.status(404).json({ error: 'Tag not found' });
            res.json(tag);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getTagsByIds: async (req, res) => {
        const idsParam = req.params.ids;
        if (!idsParam) return res.status(400).json({ error: 'No IDs received' });

        try {
            const ids = idsParam.split(',').map(id => Number(id.trim()));
            const tagRows = await tagService.getTagsByIds(ids);
            if (tagRows.length === 0) return res.status(404).json({ error: 'Tag not found', tagRows });
            res.json(tagRows);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getTagByName: async (req, res) => {
        const tagName = req.params.name;
        try {
            const rows = await tagService.getTagByName(tagName);
            if (rows.length === 0) return res.status(404).json({ error: 'Tag not found' });
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateTag: async (req, res) => {
        const id = req.params.id;
        const { tagName, usability, attributes } = req.body;

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
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteTag: async (req, res) => {
        const id = req.params.id;
        try {
            const success = await tagService.deleteTag(id);
            if (!success) return res.status(404).json({ message: 'The tag to remove was not found.' });
            res.json({ message: 'Tag and related attributes deleted successfully', deletedId: id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

export default tagController;
