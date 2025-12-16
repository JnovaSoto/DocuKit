import { all, prepare } from '../../db/database.js';

const attributeService = {
    /**
     * Retrieves all attributes from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAllAttributes: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attributes`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Creates multiple attributes for a tag.
     * @param {number} tagId - The ID of the tag the attributes belong to.
     * @param {Array<Object>} attributes - An array of attribute objects containing `attribute` and `info` properties.
     * @returns {Promise<void>} A promise that resolves when the attributes are created.
     */
    createAttributes: (tagId, attributes) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO attributes (attribute, info, tagId) VALUES (?, ?, ?)`;
            const stmt = prepare(sql);

            for (const attr of attributes) {
                if (!attr.attribute) continue;
                stmt.run([attr.attribute, attr.info, tagId]);
            }

            stmt.finalize(err => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    /**
     * Retrieves attributes associated with a specific tag ID.
     * @param {number} tagId - The ID of the tag.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAttributesByTagId: (tagId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attributes WHERE tagId = ?`;
            all(sql, tagId, (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
    },

    /**
     * Retrieves attributes by their name.
     * @param {string} name - The name of the attribute to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching attribute objects.
     */
    getAttributesByName: (name) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attributes WHERE attribute = ?`;
            all(sql, [name], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
};

export default attributeService;
