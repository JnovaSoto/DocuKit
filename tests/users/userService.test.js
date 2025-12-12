// tests/users/userService.test.js

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Import the mocks and the service under test dynamically
const { get, run } = await import('../../mocks/database/database.js');
const { default: userService } = await import('../../services/users/userService.js');

// Mock Data
const mockUserLogin = {
    username: 'terwy54',
    email: 'terwy54@gmail.com',
    password: "$2b$10$JmTs2qnmpOMwcAjt.RUhyurYfnmy1q5a6ssJ1FPwdEc6gsr/guC6S",
};

describe("userService Unit Tests", () => {

    // Clean all the mocks before each test
    beforeEach(() => {
        get.mockClear();
        run.mockClear();
    });

    //Testing the findByLogin function with username
    test('should return user data on successful login with username', async () => {

        get.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockUserLogin);
        });

        const result = await userService.findByLogin('userAdmin12345');

        expect(result).toEqual(mockUserLogin);
        expect(get).toHaveBeenCalledTimes(1);
    });

    //Testing the findByLogin function with email
    test('should return user data on successful login with email', async () => {

        get.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockUserLogin);
        });

        const result = await userService.findByLogin('userAdmin12345@gmail.com');

        expect(result).toEqual(mockUserLogin);
        expect(get).toHaveBeenCalledTimes(1);
    });

});