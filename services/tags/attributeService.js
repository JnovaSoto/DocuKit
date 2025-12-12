import { all, prepare } from '../../db/database.js';

const attributeService = {
    getAllAttributes: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attributes`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

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

    getAttributesByTagId: (tagId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attributes WHERE tagId = ?`;
            all(sql, tagId, (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
    },

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
