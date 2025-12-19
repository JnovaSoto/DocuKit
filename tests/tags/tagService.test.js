import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the Prisma dependency
jest.unstable_mockModule('../../db/prisma.js', () => {
    return import('../../mocks/prisma.js');
});

const { default: prisma } = await import('../../db/prisma.js');
const { default: tagService } = await import('../../services/tags/tagService.js');

describe('Tag Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should get all tags', async () => {
        const mockTags = [{ id: 1, tagName: 'Urgent' }, { id: 2, tagName: 'Archive' }];
        prisma.tag.findMany.mockResolvedValue(mockTags);

        const tags = await tagService.getAllTags();
        expect(tags).toEqual(mockTags);
        expect(prisma.tag.findMany).toHaveBeenCalled();
    });

    test('should reject when there is a database error', async () => {
        prisma.tag.findMany.mockRejectedValue(new Error('DB Error'));

        await expect(tagService.getAllTags()).rejects.toThrow('DB Error');
    });

    test('should create a tag and return its ID', async () => {
        const mockTag = { id: 10 };
        prisma.tag.create.mockResolvedValue(mockTag);

        const id = await tagService.createTag('NewTag', 'Global', 'Content');
        expect(id).toBe(10);
        expect(prisma.tag.create).toHaveBeenCalledWith({
            data: {
                tagName: 'NewTag',
                usability: 'Global',
                content: 'Content'
            }
        });
    });

    test('should get a tag by id', async () => {
        const mockTag = { id: 1, tagName: 'TestTag' };
        prisma.tag.findUnique.mockResolvedValue(mockTag);

        const tag = await tagService.getTagById(1);
        expect(tag.tagName).toBe('TestTag');
        expect(prisma.tag.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });
    });

    test('should get tags by multiple ids', async () => {
        const mockTags = [{ id: 1 }, { id: 2 }];
        prisma.tag.findMany.mockResolvedValue(mockTags);

        const tags = await tagService.getTagsByIds([1, 2]);
        expect(tags.length).toBe(2);
        expect(prisma.tag.findMany).toHaveBeenCalledWith({
            where: {
                id: { in: [1, 2] }
            }
        });
    });

    test('should update tag and its attributes', async () => {
        prisma.tag.update.mockResolvedValue({ id: 1 });

        const result = await tagService.updateTag(1, 'Updated', 'Usage', [{ attribute: 'key', info: 'val' }]);

        expect(result).toBe(true);
        expect(prisma.tag.update).toHaveBeenCalled();
    });

    test('should return null if updating non-existent tag', async () => {
        const error = new Error('Not found');
        error.code = 'P2025';
        prisma.tag.update.mockRejectedValue(error);

        const result = await tagService.updateTag(999, 'None', 'None');
        expect(result).toBe(null);
    });

    test('should delete tag', async () => {
        prisma.tag.delete.mockResolvedValue({ id: 1 });

        const result = await tagService.deleteTag(1);
        expect(result).toBe(true);
        expect(prisma.tag.delete).toHaveBeenCalledWith({
            where: { id: 1 }
        });
    });

    test('should return false if deleting non-existent tag', async () => {
        const error = new Error('Not found');
        error.code = 'P2025';
        prisma.tag.delete.mockRejectedValue(error);

        const result = await tagService.deleteTag(999);
        expect(result).toBe(false);
    });
});