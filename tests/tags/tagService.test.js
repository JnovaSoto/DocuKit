// tests/tags/tagService.test.js

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Import the mocks and the service under test dynamically
const { get, run, all, prepare } = await import('../../mocks/database/database.js');
const { default: tagService } = await import('../../services/tags/tagService.js');

describe('Tag Service', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    // Testing getAllTags
    test('should get all tags', async () => {
        const mockTags = [{ id: 1, tagName: 'Urgent' }, { id: 2, tagName: 'Archive' }];
        all.mockImplementation((sql, params, callback) => callback(null, mockTags));

        const tags = await tagService.getAllTags();
        expect(tags).toEqual(mockTags);
        expect(tags.length).toBe(2);
    });

    // Testing error handling
    test('should reject when there is a database error', async () => {
        all.mockImplementation((sql, params, callback) => {
            callback(new Error('DB Error'), null);
        });

        await expect(tagService.getAllTags()).rejects.toThrow('DB Error');
    });

    // Testing createTag
    test('should create a tag and return lastID', async () => {
        const mockId = 10;
        run.mockImplementation(function (sql, params, callback) {
            callback.call({ lastID: mockId }, null);
        });

        const id = await tagService.createTag('NewTag', 'Global', 'Content');
        expect(id).toBe(mockId);
    });

    // Testing getTagById
    test('should get a tag by id', async () => {
        const mockTag = { id: 1, tagName: 'TestTag' };
        get.mockImplementation((sql, params, callback) => callback(null, mockTag));

        const tag = await tagService.getTagById(1);
        expect(tag.tagName).toBe('TestTag');
    });

    // Testing getTagsByIds
    test('should get tags by multiple ids', async () => {
        const mockTags = [{ id: 1 }, { id: 2 }];
        all.mockImplementation((sql, params, callback) => callback(null, mockTags));

        const tags = await tagService.getTagsByIds([1, 2]);
        expect(tags.length).toBe(2);
        expect(all).toHaveBeenCalledWith(expect.stringContaining('IN (?,?)'), [1, 2], expect.any(Function));
    });

    // Testing updateTag
    test('should update tag and its attributes', async () => {

        const mockStmt = {
            run: jest.fn(),
            finalize: jest.fn((cb) => cb(null))
        };
        prepare.mockReturnValue(mockStmt);

        run.mockImplementationOnce(function (sql, params, cb) {
            cb.call({ changes: 1 }, null);
        });
        run.mockImplementationOnce((sql, params, cb) => cb(null));

        const result = await tagService.updateTag(1, 'Updated', 'Usage', [{ attribute: 'key', info: 'val' }]);

        expect(result).toBe(true);
        expect(mockStmt.run).toHaveBeenCalled();
        expect(mockStmt.finalize).toHaveBeenCalled();
    });

    // Testing deleteTag
    test('should delete tag and its attributes', async () => {
        run.mockImplementationOnce((sql, params, cb) => cb(null));
        run.mockImplementationOnce(function (sql, params, cb) {
            cb.call({ changes: 1 }, null);
        });

        const result = await tagService.deleteTag(1);
        expect(result).toBe(true);
        expect(run).toHaveBeenCalledTimes(2);
    });

    // Testing deleteTag
    test('should return false if deleting non-existent tag', async () => {
        run.mockImplementationOnce((sql, params, cb) => cb(null));
        run.mockImplementationOnce(function (sql, params, cb) {
            cb.call({ changes: 0 }, null);
        });

        const result = await tagService.deleteTag(999);
        expect(result).toBe(false);
    });
});