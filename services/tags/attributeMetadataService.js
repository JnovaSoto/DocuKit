import { get, run, all } from '../../db/database.js';

const attributeMetadataService = {
    /**
     * Retrieves all attribute metadata from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of metadata objects.
     */
    getAllMetadata: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attribute_metadata ORDER BY attributeName ASC`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Retrieves metadata for a specific attribute by name.
     * @param {string} name - The name of the attribute.
     * @returns {Promise<Object>} A promise that resolves to the metadata object.
     */
    getMetadataByName: (name) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attribute_metadata WHERE attributeName = ?`;
            get(sql, [name], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    /**
     * Creates new metadata for an attribute.
     * @param {string} attributeName - The name of the attribute.
     * @param {string} generalDescription - A general description of the attribute.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created metadata.
     */
    createMetadata: (attributeName, generalDescription) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO attribute_metadata (attributeName, generalDescription) VALUES (?, ?)`;
            run(sql, [attributeName, generalDescription], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }
};

export default attributeMetadataService;
