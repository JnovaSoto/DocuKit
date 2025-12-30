import prisma from '../../db/prisma.js';

/**
 * Service for handling CSS property-related database operations using Prisma.
 */
const propertyService = {
    /**
     * Retrieves all properties from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of property objects.
     */
    getAllProperties: async () => {
        return await prisma.property.findMany();
    },

    /**
     * Creates a new property.
     * @param {string} propertyName - The name of the property.
     * @param {string} usability - A description of the property's usability.
     * @param {string} [content] - Optional additional content for the property.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created property.
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
     * Retrieves a property by its ID.
     * @param {number} id - The ID of the property to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to the property object if found, or null.
     */
    getPropertyById: async (id: number) => {
        return await prisma.property.findUnique({
            where: { id: id }
        });
    },

    /**
     * Retrieves multiple properties by their IDs.
     * @param {Array<number>} ids - An array of property IDs.
     * @returns {Promise<Array>} A promise that resolves to an array of property objects.
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
     * Retrieves a property by its name.
     * @param {string} propertyName - The name of the property to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching property objects.
     */
    getPropertyByName: async (propertyName: string) => {
        return await prisma.property.findMany({
            where: {
                propertyName: propertyName.toLowerCase()
            }
        });
    },

    /**
     * Updates an existing property and its attributes.
     * @param {number} id - The ID of the property to update.
     * @param {string} propertyName - The new name of the property.
     * @param {string} usability - The new usability description.
     * @param {Array<Object>} [attributes] - An optional array of attributes to update.
     * @returns {Promise<boolean|null>} A promise that resolves to `true` if successful, or `null` if the property was not found.
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
     * Deletes a property and its related attributes.
     * @param {number} id - The ID of the property to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the property was deleted, or `false` if not found.
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
