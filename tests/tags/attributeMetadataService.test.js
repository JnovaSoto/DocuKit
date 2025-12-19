import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the Prisma dependency
jest.unstable_mockModule('../../db/prisma.js', () => {
    return import('../../mocks/prisma.js');
});

const { default: prisma } = await import('../../db/prisma.js');
const { default: metadataService } = await import('../../services/tags/attributeMetadataService.js');

describe('Attribute Metadata Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should get all metadata ordered by name', async () => {
        const mockData = [
            { id: 1, attributeName: 'A-Tag' },
            { id: 2, attributeName: 'B-Tag' }
        ];

        prisma.attributeMetadata.findMany.mockResolvedValue(mockData);

        const result = await metadataService.getAllMetadata();

        expect(result).toEqual(mockData);
        expect(prisma.attributeMetadata.findMany).toHaveBeenCalledWith({
            orderBy: { attributeName: 'asc' }
        });
    });

    test('should get a single metadata by name', async () => {
        const mockRow = { id: 1, attributeName: 'Color', generalDescription: 'Test' };

        prisma.attributeMetadata.findUnique.mockResolvedValue(mockRow);

        const result = await metadataService.getMetadataByName('Color');

        expect(result).toEqual(mockRow);
        expect(prisma.attributeMetadata.findUnique).toHaveBeenCalledWith({
            where: { attributeName: 'Color' }
        });
    });

    test('should create metadata and return the new ID', async () => {
        const mockId = 50;
        prisma.attributeMetadata.create.mockResolvedValue({ id: mockId });

        const newId = await metadataService.createMetadata('Tag-Test', 'Description-Test');

        expect(newId).toBe(mockId);
        expect(prisma.attributeMetadata.create).toHaveBeenCalledWith({
            data: {
                attributeName: 'Tag-Test',
                generalDescription: 'Description-Test'
            }
        });
    });

    test('should reject if database fails on creation', async () => {
        prisma.attributeMetadata.create.mockRejectedValue(new Error('DB Insert Error'));

        await expect(metadataService.createMetadata('fail', 'fail'))
            .rejects.toThrow('DB Insert Error');
    });
});