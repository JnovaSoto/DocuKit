import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the Prisma dependency
jest.unstable_mockModule('../../db/prisma.js', () => {
    return import('../../mocks/prisma.js');
});

const { default: prisma } = await import('../../db/prisma.js');
const { default: attributeService } = await import('../../services/tags/attributeService.js');

describe('Tag Attribute Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should get all tag attributes', async () => {
        const mockRows = [{ id: 1, attribute: 'Prioridad', tagId: 1 }];
        prisma.attribute.findMany.mockResolvedValue(mockRows);

        const result = await attributeService.getAllAttributes();

        expect(result).toEqual(mockRows);
        expect(prisma.attribute.findMany).toHaveBeenCalled();
    });

    test('should create multiple tag attributes', async () => {
        prisma.attribute.createMany.mockResolvedValue({ count: 2 });

        const tagId = 5;
        const attributes = [
            { attribute: 'Status', info: 'Active' },
            { attribute: 'Version', info: '1.0' }
        ];

        await attributeService.createAttributes(tagId, attributes);

        expect(prisma.attribute.createMany).toHaveBeenCalled();
    });

    test('should get attributes by tagId', async () => {
        const mockRows = [{ attribute: 'Category', tagId: 10 }];
        prisma.attribute.findMany.mockResolvedValue(mockRows);

        const result = await attributeService.getAttributesByTagId(10);

        expect(result).toEqual(mockRows);
        expect(prisma.attribute.findMany).toHaveBeenCalled();
    });

    test('should get attributes by name', async () => {
        const mockRows = [{ attribute: 'Prioridad', info: 'Alta' }];
        prisma.attribute.findMany.mockResolvedValue(mockRows);

        const result = await attributeService.getAttributesByName('Prioridad');

        expect(result).toEqual(mockRows);
        expect(prisma.attribute.findMany).toHaveBeenCalled();
    });
});