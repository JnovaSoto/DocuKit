import prisma from '../../db/prisma.js';

/**
 * Service for handling attribute metadata database operations using Prisma.
 */
const attributeMetadataService = {
    /**
     * Retrieves all attribute metadata from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of metadata objects.
     */
    getAllMetadata: async () => {
        return await prisma.attributeMetadata.findMany({
            orderBy: {
                attributeName: 'asc'
            }
        });
    },

    /**
     * Retrieves metadata for a specific attribute by name.
     * @param {string} name - The name of the attribute.
     * @returns {Promise<Object|null>} A promise that resolves to the metadata object.
     */
    getMetadataByName: async (name) => {
        return await prisma.attributeMetadata.findUnique({
            where: {
                attributeName: name
            }
        });
    },

    /**
     * Creates new metadata for an attribute.
     * @param {string} attributeName - The name of the attribute.
     * @param {string} generalDescription - A general description of the attribute.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created metadata.
     */
    createMetadata: async (attributeName, generalDescription) => {
        const metadata = await prisma.attributeMetadata.create({
            data: {
                attributeName,
                generalDescription
            }
        });
        return metadata.id;
    }
};

export default attributeMetadataService;
