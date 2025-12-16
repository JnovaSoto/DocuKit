// tests/users/userService.test.js 

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Import the mocks and the service under test dynamically
const { get, run, all } = await import('../../mocks/database/database.js');
const { default: metadataService } = await import('../../services/tags/attributeMetadataService.js');

describe('Attribute Metadata Service', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    // Testing getAllMetadata
    test('should get all metadata ordered by name', async () => {
        const mockData = [
            { id: 1, attributeName: 'A-Tag' },
            { id: 2, attributeName: 'B-Tag' }
        ];

        all.mockImplementation((sql, params, callback) => {
            callback(null, mockData);
        });

        const result = await metadataService.getAllMetadata();

        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(mockData);
        expect(all).toHaveBeenCalledWith(
            expect.stringContaining('ORDER BY attributeName ASC'),
            [],
            expect.any(Function)
        );
    });

    // Testing getMetadataByName
    test('should get a single metadata by name', async () => {
        const mockRow = { id: 1, attributeName: 'Color', generalDescription: 'Test' };

        get.mockImplementation((sql, params, callback) => {
            callback(null, mockRow);
        });

        const result = await metadataService.getMetadataByName('Color');

        expect(typeof result).toBe('object');
        expect(result.attributeName).toBe('Color');
        expect(get).toHaveBeenCalledWith(expect.any(String), ['Color'], expect.any(Function));
    });

    // Testing createMetadata
    test('should create metadata and return the new ID', async () => {
        const mockId = 50;

        run.mockImplementation(function (sql, params, callback) {
            callback.call({ lastID: mockId }, null);
        });

        const newId = await metadataService.createMetadata('Tag-Test', 'Description-Test');

        expect(newId).toBe(mockId);
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO attribute_metadata'),
            ['Tag-Test', 'Description-Test'],
            expect.any(Function)
        );
    });

    // Testing createMetadata error handling 
    test('should reject if database fails on creation', async () => {
        run.mockImplementation((sql, params, callback) => {
            callback(new Error('DB Insert Error'));
        });

        await expect(metadataService.createMetadata('fail', 'fail'))
            .rejects.toThrow('DB Insert Error');
    });
});