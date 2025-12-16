import { all, run, get, prepare } from '../../db/database.js';

const propertyService = {
    /**
     * Retrieves all properties from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of property objects.
     */
    getAllProperties: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM properties`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Creates a new property.
     * @param {string} propertyName - The name of the property.
     * @param {string} usability - A description of the property's usability.
     * @param {string} [content] - Optional additional content for the property.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created property.
     */
    createProperty: (propertyName, usability, content) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO properties (propertyName, usability, content) VALUES (?, ?, ?)`;
            run(sql, [propertyName, usability, content || ''], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    },

    /**
     * Retrieves a property by its ID.
     * @param {number} id - The ID of the property to retrieve.
     * @returns {Promise<Object|undefined>} A promise that resolves to the property object if found, or undefined.
     */
    getPropertyById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM properties WHERE id = ?`;
            get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    /**
     * Retrieves multiple properties by their IDs.
     * @param {Array<number>} ids - An array of property IDs.
     * @returns {Promise<Array>} A promise that resolves to an array of property objects.
     */
    getPropertiesByIds: (ids) => {
        return new Promise((resolve, reject) => {
            const placeholders = ids.map(() => '?').join(',');
            const sqlProperty = `SELECT * FROM properties WHERE id IN (${placeholders})`;

            all(sqlProperty, ids, (err, propertyRows) => {
                if (err) reject(err);
                resolve(propertyRows);
            });
        });
    },

    /**
     * Retrieves a property by its name.
     * @param {string} propertyName - The name of the property to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching property objects.
     */
    getPropertyByName: (propertyName) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM properties WHERE propertyName = ?`;
            all(sql, [propertyName.toLowerCase()], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Updates an existing property and its attributes.
     * @param {number} id - The ID of the property to update.
     * @param {string} propertyName - The new name of the property.
     * @param {string} usability - The new usability description.
     * @param {Array<Object>} [attributes] - An optional array of attributes to update.
     * @returns {Promise<boolean|null>} A promise that resolves to `true` if successful, or `null` if the property was not found.
     */
    updateProperty: (id, propertyName, usability, attributes) => {
        return new Promise((resolve, reject) => {
            const updatePropertySql = `UPDATE properties SET propertyName = ?, usability = ? WHERE id = ?`;

            run(updatePropertySql, [propertyName, usability, id], function (err) {
                if (err) return reject(new Error('Failed to update property: ' + err.message));
                if (this.changes === 0) return resolve(null);

                if (!Array.isArray(attributes)) return resolve(true);

                updateAttributes(id, attributes)
                    .then(() => resolve(true))
                    .catch(reject);
            });
        });
    },

    /**
     * Deletes a property and its related attributes.
     * @param {number} id - The ID of the property to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the property was deleted, or `false` if not found.
     */
    deleteProperty: (id) => {
        return new Promise((resolve, reject) => {
            const deleteAttributesSql = `DELETE FROM property_attributes WHERE propertyId = ?`;
            run(deleteAttributesSql, [id], function (err) {
                if (err) return reject(new Error('Failed to delete property attributes: ' + err.message));

                const deletePropertySql = `DELETE FROM properties WHERE id = ?`;
                run(deletePropertySql, [id], function (err) {
                    if (err) return reject(new Error('Failed to delete property: ' + err.message));
                    if (this.changes === 0) return resolve(false); // Property not found
                    resolve(true);
                });
            });
        });
    }
};

/**
 * Helper function to update attributes for a property.
 * Deletes existing attributes and inserts new ones.
 * @param {number} id - The ID of the property.
 * @param {Array<Object>} attributes - The new list of attributes.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
const updateAttributes = (id, attributes) => {
    return new Promise((resolve, reject) => {
        run(`DELETE FROM property_attributes WHERE propertyId = ?`, [id], (err) => {
            if (err) return reject(new Error('Failed to clear attributes: ' + err.message));
            if (attributes.length === 0) return resolve();

            const stmt = prepare(`INSERT INTO property_attributes (attribute, info, propertyId) VALUES (?, ?, ?)`);
            attributes.forEach(attr => {
                if (attr.attribute) stmt.run([attr.attribute, attr.info || '', id]);
            });

            stmt.finalize(err => err ? reject(new Error('Failed to insert attributes: ' + err.message)) : resolve());
        });
    });
};

export default propertyService;
