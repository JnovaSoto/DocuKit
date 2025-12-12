import { get, run, all } from '../../db/database.js';

const attributeMetadataService = {
    getAllMetadata: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attribute_metadata ORDER BY attributeName ASC`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getMetadataByName: (name) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attribute_metadata WHERE attributeName = ?`;
            get(sql, [name], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

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
