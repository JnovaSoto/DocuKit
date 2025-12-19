import prisma from '../../db/prisma.js';

/**
 * Service for handling tag attribute-related database operations using Prisma.
 */
const attributeService = {
    /**
     * Retrieves all attributes from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAllAttributes: async () => {
        return await prisma.attribute.findMany();
    },

    /**
     * Creates multiple attributes for a tag.
     * @param {number} tagId - The ID of the tag the attributes belong to.
     * @param {Array<Object>} attributes - An array of attribute objects containing `attribute` and `info` properties.
     * @returns {Promise<void>} A promise that resolves when the attributes are created.
     */
    createAttributes: async (tagId, attributes) => {
        const data = attributes
            .filter(attr => attr.attribute)
            .map(attr => ({
                attribute: attr.attribute,
                info: attr.info || '',
                tagId: parseInt(tagId)
            }));

        if (data.length > 0) {
            await prisma.attribute.createMany({
                data
            });
        }
    },

    /**
     * Retrieves attributes associated with a specific tag ID.
     * @param {number} tagId - The ID of the tag.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAttributesByTagId: async (tagId) => {
        return await prisma.attribute.findMany({
            where: {
                tagId: parseInt(tagId)
            }
        });
    },

    /**
     * Retrieves attributes by their name.
     * @param {string} name - The name of the attribute to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching attribute objects.
     */
    getAttributesByName: async (name) => {
        return await prisma.attribute.findMany({
            where: {
                attribute: name
            }
        });
    }
};

export default attributeService;
