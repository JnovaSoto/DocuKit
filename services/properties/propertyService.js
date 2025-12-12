import { all, run, get } from '../../db/database.js';

const propertyService = {
    getAllProperties: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM properties`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    createProperty: (propertyName, usability, content) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO properties (propertyName, usability, content) VALUES (?, ?, ?)`;
            run(sql, [propertyName, usability, content || ''], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    },

    getPropertyById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM properties WHERE id = ?`;
            get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

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

    getPropertyByName: (propertyName) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM properties WHERE propertyName = ?`;
            all(sql, [propertyName.toLowerCase()], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    updateProperty: (id, propertyName, usability, attributes) => {
        return new Promise((resolve, reject) => {
            const updatePropertySql = `UPDATE properties SET propertyName = ?, usability = ? WHERE id = ?`;
            run(updatePropertySql, [propertyName, usability, id], function (err) {
                if (err) return reject(new Error('Failed to update property: ' + err.message));
                if (this.changes === 0) return resolve(null); // Property not found

                if (attributes && Array.isArray(attributes)) {
                    const deleteAttrSql = `DELETE FROM property_attributes WHERE propertyId = ?`;
                    run(deleteAttrSql, [id], function (err) {
                        if (err) return reject(new Error('Failed to update attributes: ' + err.message));

                        if (attributes.length > 0) {
                            const insertAttrSql = `INSERT INTO property_attributes (attribute, info, propertyId) VALUES (?, ?, ?)`;
                            const stmt = prepare(insertAttrSql);

                            for (const attr of attributes) {
                                if (attr.attribute) {
                                    stmt.run([attr.attribute, attr.info || '', id]);
                                }
                            }

                            stmt.finalize((err) => {
                                if (err) return reject(new Error('Failed to insert new attributes: ' + err.message));
                                resolve(true);
                            });
                        } else {
                            resolve(true);
                        }
                    });
                } else {
                    resolve(true);
                }
            });
        });
    },

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

export default propertyService;
