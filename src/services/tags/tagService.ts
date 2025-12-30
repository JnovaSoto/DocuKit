import prisma from '../../db/prisma.js';

/**
 * Service for handling tag-related database operations using Prisma.
 */
const tagService = {
    /**
     * Retrieves all tags from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of tag objects.
     */
    getAllTags: async () => {
        return await prisma.tag.findMany();
    },

    /**
     * Creates a new tag.
     * @param {string} tagName - The name of the tag.
     * @param {string} usability - A description of the tag's usability.
     * @param {string} [content] - Optional additional content for the tag.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created tag.
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
     * Retrieves a tag by its ID.
     * @param {number} id - The ID of the tag to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to the tag object if found, or null.
     */
    getTagById: async (id: number) => {
        return await prisma.tag.findUnique({
            where: { id }
        });
    },

    /**
     * Retrieves multiple tags by their IDs.
     * @param {Array<number>} ids - An array of tag IDs.
     * @returns {Promise<Array>} A promise that resolves to an array of tag objects.
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
     * Retrieves a tag by its name.
     * @param {string} tagName - The name of the tag to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching tag objects.
     */
    getTagByName: async (tagName: string) => {
        return await prisma.tag.findMany({
            where: {
                tagName: tagName.toLowerCase()
            }
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
     * Deletes a tag and its related attributes.
     * @param {number} id - The ID of the tag to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the tag was deleted, or `false` if not found.
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
