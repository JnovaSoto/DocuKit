import { all, prepare } from '../../db/database.js';

const propertyAttributeService = {
    /**
     * Retrieves all property attributes from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAllAttributes: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM property_attributes`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Creates multiple attributes for a property.
     * @param {number} propertyId - The ID of the property the attributes belong to.
     * @param {Array<Object>} attributes - An array of attribute objects containing `attribute` and `info` properties.
     * @returns {Promise<void>} A promise that resolves when the attributes are created.
     */
    createAttributes: (propertyId, attributes) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO property_attributes (attribute, info, propertyId) VALUES (?, ?, ?)`;
            const stmt = prepare(sql);

            for (const attr of attributes) {
                if (!attr.attribute) continue;
                stmt.run([attr.attribute, attr.info, propertyId]);
            }

            stmt.finalize(err => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    /**
     * Retrieves attributes associated with a specific property ID.
     * @param {number} propertyId - The ID of the property.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAttributesByPropertyId: (propertyId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM property_attributes WHERE propertyId = ?`;
            all(sql, [propertyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Retrieves attributes by their name.
     * @param {string} attributeName - The name of the attribute to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching attribute objects.
     */
    getAttributesByName: (attributeName) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM property_attributes WHERE attribute = ?`;
            all(sql, [attributeName], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
};

export default propertyAttributeService;
