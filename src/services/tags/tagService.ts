import prisma from '../../db/prisma.js';

/**
 * Service for handling tag-related database operations using Prisma.
 */
const tagService = {
    /**
     * Retrieves all tags from the database.
     * @returns {Promise<import('@prisma/client').Tag[]>} A promise that resolves to an array of tag objects.
     */
    getAllTags: async () => {
        return await prisma.tag.findMany();
    },

    /**
     * Creates a new tag in the database.
     * @param {string} tagName - The name of the tag (e.g., 'div', 'p').
     * @param {string} usability - A description of when and how to use the tag.
     * @param {string} [content] - Optional detailed content or documentation for the tag.
     * @returns {Promise<number>} A promise that resolves to the auto-incremented ID of the new tag.
     */
    createTag: async (tagName: string, usability: string, content?: string) => {
        const tag = await prisma.tag.create({
            data: {
                tagName,
                usability,
                content: content || ''
            }
        });
        return tag.id;
    },

    /**
     * Retrieves a single tag by its unique ID.
     * @param {number} id - The integer ID of the tag.
     * @returns {Promise<import('@prisma/client').Tag|null>} The tag object if found, otherwise null.
     */
    getTagById: async (id: number) => {
        return await prisma.tag.findUnique({
            where: { id }
        });
    },

    /**
     * Retrieves multiple tags based on a list of IDs.
     * @param {number[]} ids - An array of tag IDs to fetch.
     * @returns {Promise<import('@prisma/client').Tag[]>} An array of tag objects.
     */
    getTagsByIds: async (ids: number[]) => {
        return await prisma.tag.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    },

    /**
     * Searches for tags by their name (case-insensitive).
     * @param {string} tagName - The name of the tag to search for.
     * @returns {Promise<import('@prisma/client').Tag[]>} An array of matching tag objects.
     */
    getTagByName: async (tagName: string) => {
        return await prisma.tag.findMany({
            where: {
                tagName: tagName.toLowerCase()
            }
        });
    },

    /**
     * Updates an existing tag's data and replaces its attributes.
     * @param {number} id - The ID of the tag to update.
     * @param {string} tagName - The updated name of the tag.
     * @param {string} usability - The updated usability description.
     * @param {Array<{attribute: string, info?: string}>} attributes - An array of attribute objects to associate with the tag.
     * @returns {Promise<boolean|null>} True if updated, null if tag not found.
     */
    updateTag: async (id: number, tagName: string, usability: string, attributes: any[]) => {
        try {
            const updateData: any = {
                tagName,
                usability,
            };

            if (attributes && attributes.length > 0) {
                updateData.attributes = {
                    deleteMany: {},
                    create: attributes
                        .filter(attr => attr.attribute)
                        .map(attr => ({
                            attribute: attr.attribute,
                            info: attr.info || ''
                        }))
                };
            }
            await prisma.tag.update({
                where: { id: id },
                data: updateData
            });
            return true;
        } catch (error: any) {
            // P2025 is the Prisma error code for "An operation failed because it depends on one or more records that were required but not found."
            if (error.code === 'P2025') return null;
            throw error;
        }
    },

    /**
     * Deletes a tag and all its cascading relations (attributes).
     * @param {number} id - The ID of the tag to delete.
     * @returns {Promise<boolean>} True if deleted, false if tag not found.
     */
    deleteTag: async (id: number) => {
        try {
            await prisma.tag.delete({
                where: { id }
            });
            return true;
        } catch (error: any) {
            if (error.code === 'P2025') return false;
            throw error;
        }
    }

};

export default tagService;
