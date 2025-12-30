import prisma from '../../db/prisma.js';

/**
 * Service for handling attribute metadata database operations using Prisma.
 */
const attributeMetadataService = {
    /**
     * Retrieves all attribute metadata from the database, ordered by attribute name.
     * @returns {Promise<import('@prisma/client').AttributeMetadata[]>} An array of metadata documentation objects.
     */
    getAllMetadata: async () => {
        return await prisma.attributeMetadata.findMany({
            orderBy: {
                attributeName: 'asc'
            }
        });
    },

    /**
     * Retrieves documentation metadata for a specific attribute.
     * @param {string} name - The name of the attribute (e.g., 'alt').
     * @returns {Promise<import('@prisma/client').AttributeMetadata|null>} The metadata object if found, otherwise null.
     */
    getMetadataByName: async (name: string) => {
        return await prisma.attributeMetadata.findUnique({
            where: {
                attributeName: name
            }
        });
    },

    /**
     * Creates new documentation metadata for an attribute.
     * @param {string} attributeName - The name of the attribute to document.
     * @param {string} generalDescription - The global description/documentation for this attribute.
     * @returns {Promise<number>} The ID of the newly created metadata record.
     */
    createMetadata: async (attributeName: string, generalDescription: string) => {
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
