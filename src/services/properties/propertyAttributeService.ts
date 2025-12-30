import prisma from '../../db/prisma.js';

/**
 * Service for handling CSS property attribute-related database operations using Prisma.
 */
const propertyAttributeService = {
    /**
     * Retrieves all property attributes from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAllAttributes: async () => {
        return await prisma.propertyAttribute.findMany();
    },

    /**
     * Creates multiple attributes for a property.
     * @param {number} propertyId - The ID of the property the attributes belong to.
     * @param {Array<Object>} attributes - An array of attribute objects containing `attribute` and `info` properties.
     * @returns {Promise<void>} A promise that resolves when the attributes are created.
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
     * Retrieves attributes associated with a specific property ID.
     * @param {number} propertyId - The ID of the property.
     * @returns {Promise<Array>} A promise that resolves to an array of attribute objects.
     */
    getAttributesByPropertyId: async (propertyId: number) => {
        return await prisma.propertyAttribute.findMany({
            where: {
                propertyId: propertyId
            }
        });
    },

    /**
     * Retrieves attributes by their name.
     * @param {string} attributeName - The name of the attribute to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching attribute objects.
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
