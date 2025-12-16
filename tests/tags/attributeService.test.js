// tests/tags/attributeService.test.js

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Import the mocks and the service under test dynamically
const { all, prepare } = await import('../../mocks/database/database.js');

const { default: tagAttributeService } = await import('../../services/tags/attributeService.js');

describe('Tag Attribute Service', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    // Testing getAllAttributes
    test('should get all tag attributes', async () => {
        const mockRows = [{ id: 1, attribute: 'Prioridad', tagId: 1 }];
        all.mockImplementation((sql, params, callback) => callback(null, mockRows));

        const result = await tagAttributeService.getAllAttributes();

        expect(result).toEqual(mockRows);
        expect(all).toHaveBeenCalledWith(expect.stringContaining('FROM attributes'), [], expect.any(Function));
    });

    // Testing createAttributes
    test('should create multiple tag attributes using a statement', async () => {
        const mockStmt = {
            run: jest.fn(),
            finalize: jest.fn((callback) => callback(null))
        };
        prepare.mockReturnValue(mockStmt);

        const tagId = 5;
        const attributes = [
            { attribute: 'Status', info: 'Active' },
            { attribute: 'Version', info: '1.0' },
            { attribute: '', info: 'Skipped' }
        ];

        await tagAttributeService.createAttributes(tagId, attributes);

        expect(prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO attributes'));
        expect(mockStmt.run).toHaveBeenCalledTimes(2);
        expect(mockStmt.run).toHaveBeenCalledWith(['Status', 'Active', 5]);
        expect(mockStmt.finalize).toHaveBeenCalled();
    });

    // Testing getAttributesByTagId
    test('should get attributes by tagId', async () => {
        const mockRows = [{ attribute: 'Category', tagId: 10 }];
        all.mockImplementation((sql, params, callback) => callback(null, mockRows));

        const result = await tagAttributeService.getAttributesByTagId(10);

        expect(result).toEqual(mockRows);
        expect(all).toHaveBeenCalledWith(expect.any(String), 10, expect.any(Function));
    });

    // Testing getAttributesByTagId
    test('should return an empty array if getAttributesByTagId finds nothing', async () => {
        all.mockImplementation((sql, params, callback) => callback(null, null));

        const result = await tagAttributeService.getAttributesByTagId(999);

        expect(result).toEqual([]);
    });

    // Testing getAttributesByName
    test('should get attributes by name', async () => {
        const mockRows = [{ attribute: 'Prioridad', info: 'Alta' }];
        all.mockImplementation((sql, params, callback) => callback(null, mockRows));

        const result = await tagAttributeService.getAttributesByName('Prioridad');

        expect(result).toEqual(mockRows);
        expect(all).toHaveBeenCalledWith(expect.any(String), ['Prioridad'], expect.any(Function));
    });

    // Testing getAllAttributes
    test('should reject if database fails in getAllAttributes', async () => {
        all.mockImplementation((sql, params, callback) => callback(new Error('Fatal DB Error')));

        await expect(tagAttributeService.getAllAttributes()).rejects.toThrow('Fatal DB Error');
    });
});