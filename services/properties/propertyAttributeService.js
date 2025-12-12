import db from '../../db/database.js';

const propertyAttributeService = {
    getAllAttributes: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM property_attributes`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    createAttributes: (propertyId, attributes) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO property_attributes (attribute, info, propertyId) VALUES (?, ?, ?)`;
            const stmt = db.prepare(sql);

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

    getAttributesByPropertyId: (propertyId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM property_attributes WHERE propertyId = ?`;
            db.all(sql, [propertyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getAttributesByName: (attributeName) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM property_attributes WHERE attribute = ?`;
            db.all(sql, [attributeName], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
};

export default propertyAttributeService;
