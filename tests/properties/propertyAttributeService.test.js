// tests/properties/propertyAttributeService.test.js 

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Import the mocks and the service under test dynamically
const { all, prepare } = await import('../../mocks/database/database.js');
const { default: attributeService } = await import('../../services/properties/propertyAttributeService.js');

describe('Property Attribute Service', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });


    //Testing getAllAttributes
    test('should get all attributes', async () => {
        const mockData = [{ id: 1, attribute: 'Color', info: 'Rojo' }];
        all.mockImplementation((sql, params, callback) => callback(null, mockData));

        const result = await attributeService.getAllAttributes();
        expect(result).toEqual(mockData);
        expect(all).toHaveBeenCalledWith(expect.stringContaining('SELECT *'), [], expect.any(Function));
    });


    //Testing createAttributes
    test('should create multiple attributes using a statement', async () => {
        const mockStmt = {
            run: jest.fn(),
            finalize: jest.fn((callback) => callback(null))
        };
        prepare.mockReturnValue(mockStmt);

        const propertyId = 100;
        const attributes = [
            { attribute: 'Size', info: 'Large' },
            { attribute: 'Material', info: 'Wood' },
            { attribute: '', info: 'Invalid' }
        ];

        await attributeService.createAttributes(propertyId, attributes);

        expect(prepare).toHaveBeenCalledTimes(1);
        expect(mockStmt.run).toHaveBeenCalledTimes(2);
        expect(mockStmt.run).toHaveBeenCalledWith(['Size', 'Large', 100]);
        expect(mockStmt.finalize).toHaveBeenCalled();
    });

    //Testing createAttributes error
    test('should reject if finalize fails', async () => {
        const mockStmt = {
            run: jest.fn(),
            finalize: jest.fn((callback) => callback(new Error('Finalize Error')))
        };
        prepare.mockReturnValue(mockStmt);

        await expect(attributeService.createAttributes(1, [{ attribute: 'Test' }]))
            .rejects.toThrow('Finalize Error');
    });

    //Testing getAttributesByPropertyId
    test('should get attributes by property id', async () => {
        const mockRows = [{ attribute: 'Height', info: '10m' }];
        all.mockImplementation((sql, params, callback) => {
            expect(params).toEqual([50]);
            callback(null, mockRows);
        });

        const result = await attributeService.getAttributesByPropertyId(50);
        expect(result).toBe(mockRows);
    });

    //Testing getAttributesByName
    test('should get attributes by name', async () => {
        all.mockImplementation((sql, params, callback) => callback(null, []));

        await attributeService.getAttributesByName('Material');

        expect(all).toHaveBeenCalledWith(
            expect.stringContaining('WHERE attribute = ?'),
            ['Material'],
            expect.any(Function)
        );
    });
});