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
    createProperty: async (propertyName, usability, content) => {
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
    getPropertyById: async (id) => {
        return await prisma.property.findUnique({
            where: { id: parseInt(id) }
        });
    },

    /**
     * Retrieves multiple properties by their IDs.
     * @param {Array<number>} ids - An array of property IDs.
     * @returns {Promise<Array>} A promise that resolves to an array of property objects.
     */
    getPropertiesByIds: async (ids) => {
        return await prisma.property.findMany({
            where: {
                id: {
                    in: ids.map(id => parseInt(id))
                }
            }
        });
    },

    /**
     * Retrieves a property by its name.
     * @param {string} propertyName - The name of the property to search for.
     * @returns {Promise<Array>} A promise that resolves to an array of matching property objects.
     */
    getPropertyByName: async (propertyName) => {
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
    updateProperty: async (id, propertyName, usability, attributes) => {
        try {
            await prisma.property.update({
                where: { id: parseInt(id) },
                data: {
                    propertyName,
                    usability,
                    propertyAttributes: attributes ? {
                        deleteMany: {},
                        create: attributes
                            .filter(attr => attr.attribute)
                            .map(attr => ({
                                attribute: attr.attribute,
                                info: attr.info || ''
                            }))
                    } : undefined
                }
            });
            return true;
        } catch (error) {
            if (error.code === 'P2025') return null;
            throw error;
        }
    },

    /**
     * Deletes a property and its related attributes.
     * @param {number} id - The ID of the property to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the property was deleted, or `false` if not found.
     */
    deleteProperty: async (id) => {
        try {
            await prisma.property.delete({
                where: { id: parseInt(id) }
            });
            return true;
        } catch (error) {
            if (error.code === 'P2025') return false;
            throw error;
        }
    }
};

export default propertyService;
