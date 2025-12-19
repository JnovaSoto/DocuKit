import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the Prisma dependency
jest.unstable_mockModule('../../db/prisma.js', () => {
    return import('../../mocks/prisma.js');
});

const { default: prisma } = await import('../../db/prisma.js');
const { default: propertyService } = await import('../../services/properties/propertyService.js');

describe('Property Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should get all properties', async () => {
        const mockProperties = [
            { id: 1, propertyName: 'test', usability: 'test', content: 'test' },
            { id: 2, propertyName: 'test2', usability: 'test', content: 'test' },
        ];

        prisma.property.findMany.mockResolvedValue(mockProperties);

        const properties = await propertyService.getAllProperties();
        expect(properties).toBeDefined();
        expect(properties.length).toBe(2);
        expect(properties).toEqual(mockProperties);
    });

    test('should create a property and return ID', async () => {
        const mockId = 1;
        prisma.property.create.mockResolvedValue({ id: mockId });

        const result = await propertyService.createProperty('New Property', 'Residential', 'Some content');

        expect(result).toBe('1');
        expect(prisma.property.create).toHaveBeenCalled();
    });

    test('should get a property by id', async () => {
        const mockProperty = { id: 1, propertyName: 'Prop' };
        prisma.property.findUnique.mockResolvedValue(mockProperty);

        const property = await propertyService.getPropertyById(1);
        expect(property).toBeDefined();
        expect(property.id).toBe(1);
    });

    test('should get properties by ids', async () => {
        const mockProperties = [{ id: 1 }, { id: 2 }];
        prisma.property.findMany.mockResolvedValue(mockProperties);

        const properties = await propertyService.getPropertiesByIds([1, 2]);
        expect(properties.length).toBe(2);
    });

    test('should update property and its attributes', async () => {
        prisma.property.update.mockResolvedValue({ id: 1 });

        const result = await propertyService.updateProperty(
            1,
            'Propiedad Test',
            'Res',
            [{ attribute: 'Color', info: 'RGB' }]
        );

        expect(result).toBe(true);
        expect(prisma.property.update).toHaveBeenCalled();
    });

    test('should delete property', async () => {
        prisma.property.delete.mockResolvedValue({ id: 1 });

        const result = await propertyService.deleteProperty(1);

        expect(result).toBe(true);
        expect(prisma.property.delete).toHaveBeenCalled();
    });
});