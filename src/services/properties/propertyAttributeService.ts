import prisma from '../../db/prisma.js';

/**
 * Service for handling CSS property attribute-related database operations using Prisma.
 */
const propertyAttributeService = {
    /**
     * Retrieves all CSS property attributes from the database.
     * @returns {Promise<import('@prisma/client').PropertyAttribute[]>} An array of attribute objects.
     */
    getAllAttributes: async () => {
        return await prisma.propertyAttribute.findMany();
    },

    /**
     * Creates and associates multiple attributes with a CSS property.
     * @param {number} propertyId - The ID of the parent CSS property.
     * @param {Array<{attribute: string, info: string}>} attributes - An array of attribute data.
     * @returns {Promise<void>}
     */
    createAttributes: async (propertyId: number, attributes: { attribute: string; info: string }[]) => {
        const data = attributes
            .filter(attr => attr.attribute)
            .map(attr => ({
                attribute: attr.attribute,
                info: attr.info || '',
                propertyId: propertyId
            }));

        if (data.length > 0) {
            await prisma.propertyAttribute.createMany({
                data
            });
        }
    },

    /**
     * Retrieves all attributes for a specific CSS property.
     * @param {number} propertyId - The ID of the CSS property.
     * @returns {Promise<import('@prisma/client').PropertyAttribute[]>} An array of attributes for the given property.
     */
    getAttributesByPropertyId: async (propertyId: number) => {
        return await prisma.propertyAttribute.findMany({
            where: {
                propertyId: propertyId
            }
        });
    },

    /**
     * Searches for CSS property attributes by their key name.
     * @param {string} attributeName - The name of the attribute.
     * @returns {Promise<import('@prisma/client').PropertyAttribute[]>} An array of matching attribute instances.
     */
    getAttributesByName: async (attributeName: string) => {
        return await prisma.propertyAttribute.findMany({
            where: {
                attribute: attributeName
            }
        });
    }

};

export default propertyAttributeService;
