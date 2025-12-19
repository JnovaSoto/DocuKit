import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the Prisma dependency
jest.unstable_mockModule('../../db/prisma.js', () => {
    return import('../../mocks/prisma.js');
});

const { default: prisma } = await import('../../db/prisma.js');
const { default: propertyAttributeService } = await import('../../services/properties/propertyAttributeService.js');

describe('Property Attribute Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should get all attributes', async () => {
        const mockData = [{ id: 1, attribute: 'Color', info: 'Rojo' }];
        prisma.propertyAttribute.findMany.mockResolvedValue(mockData);

        const result = await propertyAttributeService.getAllAttributes();
        expect(result).toEqual(mockData);
        expect(prisma.propertyAttribute.findMany).toHaveBeenCalled();
    });

    test('should create multiple attributes', async () => {
        prisma.propertyAttribute.createMany.mockResolvedValue({ count: 2 });

        const propertyId = 100;
        const attributes = [
            { attribute: 'Size', info: 'Large' },
            { attribute: 'Material', info: 'Wood' },
            { attribute: '', info: 'Invalid' }
        ];

        await propertyAttributeService.createAttributes(propertyId, attributes);

        expect(prisma.propertyAttribute.createMany).toHaveBeenCalled();
    });

    test('should get attributes by property id', async () => {
        const mockRows = [{ attribute: 'Height', info: '10m' }];
        prisma.propertyAttribute.findMany.mockResolvedValue(mockRows);

        const result = await propertyAttributeService.getAttributesByPropertyId(50);
        expect(result).toEqual(mockRows);
        expect(prisma.propertyAttribute.findMany).toHaveBeenCalledWith({
            where: { propertyId: 50 }
        });
    });

    test('should get attributes by name', async () => {
        prisma.propertyAttribute.findMany.mockResolvedValue([]);

        await propertyAttributeService.getAttributesByName('Material');

        expect(prisma.propertyAttribute.findMany).toHaveBeenCalledWith({
            where: { attribute: 'Material' }
        });
    });
});