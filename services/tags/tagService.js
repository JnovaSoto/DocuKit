import db from '../../db/database.js';

const tagService = {
    getAllTags: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tags`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    createTag: (tagName, usability, content) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO tags (tagName, usability, content) VALUES (?, ?, ?)`;
            db.run(sql, [tagName, usability, content || ''], function (err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    },

    getTagById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tags WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    getTagsByIds: (ids) => {
        return new Promise((resolve, reject) => {
            const placeholders = ids.map(() => '?').join(',');
            const sqlTag = `SELECT * FROM Tags WHERE id IN (${placeholders})`;

            db.all(sqlTag, ids, (err, tagRows) => {
                if (err) reject(err);
                resolve(tagRows);
            });
        });
    },

    getTagByName: (tagName) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tags WHERE tagName = ?`;
            db.all(sql, [tagName.toLowerCase()], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    updateTag: (id, tagName, usability, attributes) => {
        return new Promise((resolve, reject) => {
            const updateTagSql = `UPDATE tags SET tagName = ?, usability = ? WHERE id = ?`;
            db.run(updateTagSql, [tagName, usability, id], function (err) {
                if (err) return reject(new Error('Failed to update tag: ' + err.message));
                if (this.changes === 0) return resolve(null); // Tag not found

                if (attributes && Array.isArray(attributes)) {
                    const deleteAttrSql = `DELETE FROM attributes WHERE tagId = ?`;
                    db.run(deleteAttrSql, [id], function (err) {
                        if (err) return reject(new Error('Failed to update attributes: ' + err.message));

                        if (attributes.length > 0) {
                            const insertAttrSql = `INSERT INTO attributes (attribute, info, tagId) VALUES (?, ?, ?)`;
                            const stmt = db.prepare(insertAttrSql);
                            for (const attr of attributes) {
                                if (attr.attribute) stmt.run([attr.attribute, attr.info || '', id]);
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

    deleteTag: (id) => {
        return new Promise((resolve, reject) => {
            const deleteAttributesSql = `DELETE FROM attributes WHERE tagId = ?`;
            db.run(deleteAttributesSql, [id], function (err) {
                if (err) return reject(new Error('Failed to delete tag attributes: ' + err.message));

                const deleteTagSql = `DELETE FROM tags WHERE id = ?`;
                db.run(deleteTagSql, [id], function (err) {
                    if (err) return reject(new Error('Failed to delete tag: ' + err.message));
                    if (this.changes === 0) return resolve(false); // Tag not found
                    resolve(true);
                });
            });
        });
    }
};

export default tagService;
