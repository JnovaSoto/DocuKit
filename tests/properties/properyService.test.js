// tests/properties/propertyService.test.js 

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Import the mocks and the service under test dynamically
const { get, run, all, prepare } = await import('../../mocks/database/database.js');
const { default: propertyService } = await import('../../services/properties/propertyService.js');

describe('Property Service', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    // Testing getAllProperties
    test('should get all properties', async () => {

        const mockProperties = [
            { id: 1, name: 'test', usability: 'test', content: 'test' },
            { id: 2, name: 'test', usability: 'test', content: 'test' },
        ];

        all.mockImplementation((sql, params, callback) => {
            callback(null, mockProperties);
        });

        const properties = await propertyService.getAllProperties();
        expect(properties).toBeDefined();
        expect(Array.isArray(properties)).toBe(true);
        expect(properties.length).toBe(2);
        expect(properties).toEqual(mockProperties);
    });
    // Testing error handling
    test('should reject when there is a database error', async () => {
        all.mockImplementation((sql, params, callback) => {
            callback(new Error('DB Error'), null);
        });
        await expect(propertyService.getAllProperties()).rejects.toThrow('DB Error');
    });

    // Testing createProperty
    test('should create a property and return lastID', async () => {
        const mockId = 1;
        const propertyData = {
            name: 'New Property',
            usability: 'Residential',
            content: 'Some content'
        };

        run.mockImplementation(function (sql, params, callback) {
            const context = { lastID: mockId };
            callback.call(context, null);
        });

        const result = await propertyService.createProperty(
            propertyData.name,
            propertyData.usability,
            propertyData.content
        );

        expect(result).toBe(mockId);
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO properties'),
            [propertyData.name, propertyData.usability, propertyData.content],
            expect.any(Function)
        );
    });

    // Testing getPropertyById
    test('should get a property by id', async () => {

        get.mockImplementation((sql, params, callback) => {
            callback(null, { id: 1, name: 'Propiedad Única' });
        });

        const property = await propertyService.getPropertyById(1);
        expect(property).toBeDefined();
        expect(property.id).toBe(1);
    });
    test('should return undefined if property does not exist', async () => {
        get.mockImplementation((sql, params, callback) => {
            callback(null, undefined); // La DB no encontró nada
        });

        const property = await propertyService.getPropertyById(999);
        expect(property).toBeUndefined();
    });

    // Testing getPropertiesByIds
    test('should get properties by ids', async () => {

        all.mockImplementation((sql, params, callback) => {
            callback(null, [
                { id: 1, name: 'Prop 1' },
                { id: 2, name: 'Prop 2' }
            ]);
        });

        const properties = await propertyService.getPropertiesByIds([1, 2, 3]);
        expect(properties).toBeDefined();
        expect(Array.isArray(properties)).toBe(true);
        expect(properties.length).toBe(2);
        expect(all).toHaveBeenCalledWith(expect.any(String), [1, 2, 3], expect.any(Function));
    });

    // Testing getPropertyByName
    test('should get a property by name', async () => {
        const mockProperty = [{ id: 1, propertyName: 'test', usability: 'comercial' }];

        all.mockImplementation((sql, params, callback) => {
            callback(null, mockProperty);
        });

        const properties = await propertyService.getPropertyByName('test');

        expect(Array.isArray(properties)).toBe(true);
        expect(properties[0].propertyName).toBe('test');
        expect(properties.length).toBe(1);
    });

    // Testing updateProperty
    test('should update property and its attributes', async () => {
        const mockStmt = {
            run: jest.fn(),
            finalize: jest.fn((callback) => {
                if (callback) callback(null);
            })
        };

        prepare.mockReturnValue(mockStmt);

        run.mockImplementationOnce(function (sql, params, cb) {
            cb.call({ changes: 1 }, null);
        });
        run.mockImplementationOnce((sql, params, cb) => {
            cb(null);
        });

        const result = await propertyService.updateProperty(
            1,
            'Propiedad Test',
            'Res',
            [{ attribute: 'Color', info: 'RGB' }]
        );

        expect(result).toBe(true);
        expect(prepare).toHaveBeenCalled();
        expect(mockStmt.run).toHaveBeenCalled();
        expect(mockStmt.finalize).toHaveBeenCalled();
    });

    // Testing deleteProperty
    test('should delete property and its attributes', async () => {
        run.mockImplementationOnce((sql, params, callback) => {
            callback(null);
        });
        run.mockImplementationOnce(function (sql, params, callback) {
            callback.call({ changes: 1 }, null);
        });

        const result = await propertyService.deleteProperty(1);

        expect(result).toBe(true);
        expect(run).toHaveBeenCalledTimes(2);
    });

    test('should return false if property to delete does not exist', async () => {
        run.mockImplementationOnce((sql, params, callback) => callback(null));
        run.mockImplementationOnce(function (sql, params, callback) {
            callback.call({ changes: 0 }, null);
        });

        const result = await propertyService.deleteProperty(999);
        expect(result).toBe(false);
    });

});