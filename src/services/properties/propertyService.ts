import prisma from '../../db/prisma.js';

/**
 * Service for handling CSS property-related database operations using Prisma.
 */
const propertyService = {
    /**
     * Retrieves all CSS properties from the database.
     * @returns {Promise<import('@prisma/client').Property[]>} An array of CSS property objects.
     */
    getAllProperties: async () => {
        return await prisma.property.findMany();
    },

    /**
     * Creates a new CSS property documentation entry.
     * @param {string} propertyName - The name of the CSS property (e.g., 'display', 'margin').
     * @param {string} usability - A description of how to use the property.
     * @param {string} [content] - Optional detailed documentation for the property.
     * @returns {Promise<string>} The ID of the newly created property as a string.
     */
    createProperty: async (propertyName: string, usability: string, content: string) => {
        const property = await prisma.property.create({
            data: {
                propertyName,
                usability,
                content: content || ''
            }
        });
        return property.id.toString(); // Return as string to maintain compatibility if needed, or number
    },

    /**
     * Retrieves a single CSS property by its unique ID.
     * @param {number} id - The integer ID of the property.
     * @returns {Promise<import('@prisma/client').Property|null>} The property object if found, otherwise null.
     */
    getPropertyById: async (id: number) => {
        return await prisma.property.findUnique({
            where: { id: id }
        });
    },

    /**
     * Retrieves multiple CSS properties based on a list of IDs.
     * @param {number[]} ids - An array of property IDs to fetch.
     * @returns {Promise<import('@prisma/client').Property[]>} An array of property objects.
     */
    getPropertiesByIds: async (ids: number[]) => {
        return await prisma.property.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    },

    /**
     * Searches for CSS properties by their name (case-insensitive).
     * @param {string} propertyName - The name of the property to search for.
     * @returns {Promise<import('@prisma/client').Property[]>} An array of matching property objects.
     */
    getPropertyByName: async (propertyName: string) => {
        return await prisma.property.findMany({
            where: {
                propertyName: propertyName.toLowerCase()
            }
        });
    },

    /**
     * Updates an existing CSS property's data and replaces its attributes.
     * @param {number} id - The ID of the property to update.
     * @param {string} propertyName - The updated name of the property.
     * @param {string} usability - The updated usability description.
     * @param {Array<{attribute: string, info: string}>} [attributes] - An optional array of property attributes to update.
     * @returns {Promise<boolean|null>} True if updated, null if the property was not found.
     */
    updateProperty: async (id: number, propertyName: string, usability: string, attributes: { attribute: string; info: string }[]) => {
        try {
            const updateData: any = {
                propertyName,
                usability,
            };

            if (attributes && attributes.length > 0) {
                updateData.propertyAttributes = {
                    deleteMany: {},
                    create: attributes
                        .filter(attr => attr.attribute)
                        .map(attr => ({
                            attribute: attr.attribute,
                            info: attr.info || ''
                        }))
                };
            }
            await prisma.property.update({
                where: { id: id },
                data: updateData
            });
            return true;
        } catch (error: any) {
            if (error.code === 'P2025') return null;
            throw error;
        }
    },

    /**
     * Deletes a CSS property and its related attributes.
     * @param {number} id - The ID of the property to delete.
     * @returns {Promise<boolean>} True if deleted, false if property not found.
     */
    deleteProperty: async (id: number) => {
        try {
            await prisma.property.delete({
                where: { id: id }
            });
            return true;
        } catch (error: any) {
            if (error.code === 'P2025') return false;
            throw error;
        }
    }

};

export default propertyService;
