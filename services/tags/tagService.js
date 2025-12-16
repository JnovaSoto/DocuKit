import { get, run, all, prepare } from '../../db/database.js';

const tagService = {
    /**
     * Retrieves all tags from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of tag objects.
     */
    getAllTags: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tags`;
            all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Creates a new tag.
     * @param {string} tagName - The name of the tag.
     * @param {string} usability - A description of the tag's usability.
     * @param {string} [content] - Optional additional content for the tag.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created tag.
     */
    createTag: (tagName, usability, content) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO tags (tagName, usability, content) VALUES (?, ?, ?)`;
            run(sql, [tagName, usability, content || ''], function (err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    },

    /**
     * Retrieves a tag by its ID.
     * @param {number} id - The ID of the tag to retrieve.
     * @returns {Promise<Object|undefined>} A promise that resolves to the tag object if found, or undefined.
     */
    getTagById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tags WHERE id = ?`;
            get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    /**
     * Retrieves multiple tags by their IDs.
     * @param {Array<number>} ids - An array of tag IDs.
     * @returns {Promise<Array>} A promise that resolves to an array of tag objects.
     */
    getTagsByIds: (ids) => {
        return new Promise((resolve, reject) => {
            const placeholders = ids.map(() => '?').join(',');
            const sqlTag = `SELECT * FROM Tags WHERE id IN (${placeholders})`;

            all(sqlTag, ids, (err, tagRows) => {
                if (err) reject(err);
                resolve(tagRows);
            });
        });
    },

    /**
     * Retrieves a tag by its name.
     * @param {string} tagName - The name of the tag to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching tag objects.
     */
    getTagByName: (tagName) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tags WHERE tagName = ?`;
            all(sql, [tagName.toLowerCase()], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    /**
     * Updates an existing tag and its attributes.
     * @param {number} id - The ID of the tag to update.
     * @param {string} tagName - The new name of the tag.
     * @param {string} usability - The new usability description.
     * @param {Array<Object>} [attributes] - An optional array of attributes to update.
     * @returns {Promise<boolean|null>} A promise that resolves to `true` if successful, or `null` if the tag was not found.
     */
    updateTag: (id, tagName, usability, attributes) => {
        return new Promise((resolve, reject) => {
            const updateTagSql = `UPDATE tags SET tagName = ?, usability = ? WHERE id = ?`;

            run(updateTagSql, [tagName, usability, id], function (err) {
                if (err) return reject(new Error('Failed to update tag: ' + err.message));
                if (this.changes === 0) return resolve(null);

                if (!Array.isArray(attributes)) return resolve(true);

                updateTagAttributes(id, attributes)
                    .then(() => resolve(true))
                    .catch(reject);
            });
        });
    },

    /**
     * Deletes a tag and its related attributes.
     * @param {number} id - The ID of the tag to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the tag was deleted, or `false` if not found.
     */
    deleteTag: (id) => {
        return new Promise((resolve, reject) => {
            const deleteAttributesSql = `DELETE FROM attributes WHERE tagId = ?`;
            run(deleteAttributesSql, [id], function (err) {
                if (err) return reject(new Error('Failed to delete tag attributes: ' + err.message));

                const deleteTagSql = `DELETE FROM tags WHERE id = ?`;
                run(deleteTagSql, [id], function (err) {
                    if (err) return reject(new Error('Failed to delete tag: ' + err.message));
                    if (this.changes === 0) return resolve(false);
                    resolve(true);
                });
            });
        });
    }
};

/**
 * Helper function to update attributes for a tag.
 * Deletes existing attributes and inserts new ones.
 * @param {number} tagId - The ID of the tag.
 * @param {Array<Object>} attributes - The new list of attributes.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
const updateTagAttributes = (tagId, attributes) => {
    return new Promise((resolve, reject) => {
        run(`DELETE FROM attributes WHERE tagId = ?`, [tagId], (err) => {
            if (err) return reject(new Error('Failed to clear attributes: ' + err.message));

            if (attributes.length === 0) return resolve();

            const stmt = prepare(`INSERT INTO attributes (attribute, info, tagId) VALUES (?, ?, ?)`);
            attributes.forEach(attr => {
                if (attr.attribute) stmt.run([attr.attribute, attr.info || '', tagId]);
            });

            stmt.finalize(err => err ? reject(new Error('Failed to insert attributes: ' + err.message)) : resolve());
        });
    });
};
export default tagService;
