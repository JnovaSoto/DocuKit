import prisma from '../../db/prisma.js';

/**
 * Service for handling tag attribute-related database operations using Prisma.
 */
const attributeService = {
    /**
     * Retrieves all attributes from the database.
     * @returns {Promise<import('@prisma/client').Attribute[]>} A promise that resolves to an array of attribute objects.
     */
    getAllAttributes: async () => {
        return await prisma.attribute.findMany();
    },

    /**
     * Creates multiple attributes and associates them with a specific tag.
     * @param {number} tagId - The ID of the parent tag.
     * @param {Array<{attribute: string, info?: string}>} attributes - An array of attribute data objects.
     * @returns {Promise<void>}
     */
    createAttributes: async (tagId: number, attributes: { attribute: string; info?: string }[]) => {
        const data = attributes
            .filter(attr => attr.attribute)
            .map(attr => ({
                attribute: attr.attribute,
                info: attr.info || '',
                tagId: tagId
            }));

        if (data.length > 0) {
            await prisma.attribute.createMany({
                data
            });
        }
    },

    /**
     * Retrieves all attributes associated with a specific tag.
     * @param {number} tagId - The ID of the tag.
     * @returns {Promise<import('@prisma/client').Attribute[]>} An array of attributes for the given tag.
     */
    getAttributesByTagId: async (tagId: number) => {
        return await prisma.attribute.findMany({
            where: {
                tagId: tagId
            }
        });
    },

    /**
     * Searches for attributes by their key name.
     * @param {string} name - The name of the attribute (e.g., 'class', 'href').
     * @returns {Promise<import('@prisma/client').Attribute[]>} An array of matching attribute instances.
     */
    getAttributesByName: async (name: string) => {
        return await prisma.attribute.findMany({
            where: {
                attribute: name
            }
        });
    }

};

export default attributeService;
