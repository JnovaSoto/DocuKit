//mocks/database/database.js
import { jest } from '@jest/globals';

const mockStatement = {
    run: jest.fn(),
    finalize: jest.fn((callback) => callback(null)),
};


export const get = jest.fn();
export const run = jest.fn();
export const all = jest.fn();
export const prepare = jest.fn(() => mockStatement);

export const mockDb = {
    get,
    run,
    all,
    prepare,
    mockStatement,
};

