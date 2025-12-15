// tests/tags/tagService.test.js

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Import the mocks and the service under test dynamically
const { get, run } = await import('../../mocks/database/database.js');
const { default: tagService } = await import('../../services/tags/tagService.js');
