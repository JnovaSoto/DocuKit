// tests/users/userService.test.js 

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the database dependency using unstable_mockModule for ESM support
jest.unstable_mockModule('../../db/database.js', () => {
    return import('../../mocks/database/database.js');
});

// Mock bcrypt dependency
jest.unstable_mockModule('bcrypt', () => ({
    default: {
        hash: jest.fn(),
        compare: jest.fn()
    }
}));

// Import the mocks and the service under test dynamically
const { get, run } = await import('../../mocks/database/database.js');
const { default: bcrypt } = await import('bcrypt');
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
        bcrypt.hash.mockClear();
        bcrypt.compare.mockClear();
    });


    // ------------------------------------------------------------------------
    // Tests for findByLogin
    // ------------------------------------------------------------------------


    //Testing the findByLogin function with username
    test('should return user data on successful login with username', async () => {

        get.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockUserLogin);
        });

        const result = await userService.findByLogin(mockUserLogin.username);

        expect(get).toHaveBeenCalledWith(

            expect.stringContaining('SELECT * FROM users WHERE username = ? OR email = ?'),

            [mockUserLogin.username, mockUserLogin.username],

            expect.any(Function)
        );

        expect(result).toEqual(mockUserLogin);
        expect(get).toHaveBeenCalledTimes(1);
    });

    //Testing the findByLogin function with email
    test('should return user data on successful login with email', async () => {

        get.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockUserLogin);
        });

        const result = await userService.findByLogin(mockUserLogin.email);

        expect(get).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM users WHERE username = ? OR email = ?'),

            [mockUserLogin.email, mockUserLogin.email],

            expect.any(Function)
        );

        expect(result).toEqual(mockUserLogin);
        expect(get).toHaveBeenCalledTimes(1);
    });

    //Testing the findByLogin function with error
    test('should reject promise if the DB returns an error', async () => {

        const mockError = new Error('Database connection lost');

        get.mockImplementationOnce((sql, params, callback) => {
            callback(mockError, null);
        });

        await expect(userService.findByLogin('cualquiera')).rejects.toThrow(mockError);

        expect(get).toHaveBeenCalledTimes(1);
    });

    //Testing the findByLogin function with non-existent user
    test('should resolve to null/undefined when user is not found', async () => {

        const nonExistentLogin = 'nonexistentUser123';

        get.mockImplementationOnce((sql, params, callback) => {
            callback(null, null);
        });

        const result = await userService.findByLogin(nonExistentLogin);
        expect(result).toBeNull();

        expect(get).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM users WHERE username = ? OR email = ?'),
            [nonExistentLogin, nonExistentLogin],
            expect.any(Function)
        );
        expect(get).toHaveBeenCalledTimes(1);
    });

    // ------------------------------------------------------------------------
    // Tests for createUser
    // ------------------------------------------------------------------------

    //Testing the createUser function with success
    test('should create a new user and return the inserted ID', async () => {
        const mockId = 123;
        const hashedPassword = 'hashed_password_mock';
        const newUser = {
            username: 'newUser',
            email: 'new@example.com',
            password: 'plainPassword',
            admin: 0
        };

        // Mock bcrypt.hash to return a specific hash
        bcrypt.hash.mockResolvedValue(hashedPassword);

        // Mock run to simulate successful insertion and this.lastID
        run.mockImplementation(function (sql, params, callback) {
            // Using .call to bind 'this' explicitly
            callback.call({ lastID: mockId }, null);
        });

        const result = await userService.createUser(
            newUser.username,
            newUser.email,
            newUser.password,
            newUser.admin
        );

        // Verify bcrypt hash was called
        expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);

        // Verify database run was called with correct params including flushed password
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO users'),
            [newUser.username, newUser.email, hashedPassword, newUser.admin],
            expect.any(Function)
        );

        // Verify return value is the lastID
        expect(result).toBe(mockId);
    });

    //Testing the createUser function with error
    test('should reject if bcrypt fails', async () => {
        const mockError = new Error('Encryption failed');

        bcrypt.hash.mockRejectedValue(mockError);

        await expect(userService.createUser('user', 'email', 'pass', 0))
            .rejects.toThrow(mockError);

        // Database should not be called if hashing fails
        expect(run).not.toHaveBeenCalled();
    });

    //Testing the createUser function with error
    test('should reject if database insertion fails', async () => {
        const mockError = new Error('Duplicate entry');
        const hashedPassword = 'hashed_success';

        bcrypt.hash.mockResolvedValue(hashedPassword);

        run.mockImplementation((sql, params, callback) => {
            callback(mockError); // returns error
        });

        await expect(userService.createUser('user', 'email', 'pass', 0))
            .rejects.toThrow(mockError);

        expect(run).toHaveBeenCalledTimes(1);
    });


    // ------------------------------------------------------------------------
    // Tests for updatePhoto
    // ------------------------------------------------------------------------

    //Testing the updatePhoto function with success
    test('should update user photo successfully', async () => {
        const userId = 1;
        const photoPath = '/path/to/photo.jpg';

        run.mockImplementation((sql, params, callback) => {
            callback(null);
        });

        await userService.updatePhoto(userId, photoPath);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE users SET photo = ? WHERE id = ?'),
            [photoPath, userId],
            expect.any(Function)
        );
    });

    //Testing the updatePhoto function with error
    test('should reject if update photo fails', async () => {
        const mockError = new Error('Update failed');

        run.mockImplementation((sql, params, callback) => {
            callback(mockError);
        });

        await expect(userService.updatePhoto(1, 'path')).rejects.toThrow(mockError);
    });

    // ------------------------------------------------------------------------
    // Tests for findById
    // ------------------------------------------------------------------------

    //Testing the findById function with success
    test('should return user by id', async () => {
        const mockRow = { id: 1, username: 'test' };

        get.mockImplementation((sql, params, callback) => {
            callback(null, mockRow);
        });

        const result = await userService.findById(1);
        expect(result).toEqual(mockRow);

        expect(get).toHaveBeenCalledWith(
            expect.stringContaining('SELECT id, username, email, admin, photo, favorites, favoritesCss FROM users'),
            [1],
            expect.any(Function)
        );
    });

    //Testing the findById function with non-existent user
    test('should return undefined/null if user not found by id', async () => {
        get.mockImplementation((sql, params, callback) => {
            callback(null, undefined);
        });

        const result = await userService.findById(999);
        expect(result).toBeUndefined();
    });

    //Testing the findById function with error
    test('should reject if findById fails', async () => {
        const mockError = new Error('DB Error');
        get.mockImplementation((sql, params, callback) => {
            callback(mockError);
        });

        await expect(userService.findById(1)).rejects.toThrow(mockError);
    });

    // ------------------------------------------------------------------------
    // Tests for findByIdAdmin
    // ------------------------------------------------------------------------

    //Testing the findByIdAdmin function with success
    test('should return user data for admin including potential sensitive fields', async () => {
        const mockRow = { id: 1, username: 'admin', password: 'hashedpassword' };

        get.mockImplementation((sql, params, callback) => {
            callback(null, mockRow);
        });

        const result = await userService.findByIdAdmin(1);
        expect(result).toEqual(mockRow);

        expect(get).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM users WHERE ID = ?'),
            [1],
            expect.any(Function)
        );
    });

    //Testing the findByIdAdmin function with error
    test('should reject findByIdAdmin on error', async () => {
        const mockError = new Error('DB Error');
        get.mockImplementation((sql, params, callback) => {
            callback(mockError);
        });

        await expect(userService.findByIdAdmin(1)).rejects.toThrow(mockError);
    });

    // ------------------------------------------------------------------------
    // Tests for getFavorites
    // ------------------------------------------------------------------------

    //Testing the getFavorites function with success
    test('should return empty array if user not found (null row)', async () => {
        get.mockImplementation((sql, params, callback) => {
            callback(null, null); // no row found
        });

        const result = await userService.getFavorites(999);
        expect(result).toBeNull();
    });

    //Testing the getFavorites function with success
    test('should return parsed favorites for tags (default type)', async () => {
        const mockFavorites = [1, 2, 3];
        const mockRow = { favorites: JSON.stringify(mockFavorites) };

        get.mockImplementation((sql, params, callback) => {
            callback(null, mockRow);
        });

        const result = await userService.getFavorites(1);
        expect(result).toEqual(mockFavorites);

        expect(get).toHaveBeenCalledWith(
            expect.stringContaining('SELECT favorites FROM users'),
            [1],
            expect.any(Function)
        );
    });

    //Testing the getFavorites function with success
    test('should return parsed favorites for css', async () => {
        const mockFavorites = [10, 20];
        const mockRow = { favoritesCss: JSON.stringify(mockFavorites) };

        get.mockImplementation((sql, params, callback) => {
            callback(null, mockRow);
        });

        const result = await userService.getFavorites(1, 'css');
        expect(result).toEqual(mockFavorites);

        expect(get).toHaveBeenCalledWith(
            expect.stringContaining('SELECT favoritesCss FROM users'),
            [1],
            expect.any(Function)
        );
    });

    //Testing the getFavorites function with success
    test('should return empty array if JSON parse fails', async () => {
        const mockRow = { favorites: '{invalid_json' };

        get.mockImplementation((sql, params, callback) => {
            callback(null, mockRow);
        });

        const result = await userService.getFavorites(1);
        expect(result).toEqual([]);
    });

    //Testing the getFavorites function with success
    test('should return empty array if field is empty/null', async () => {
        const mockRow = { favorites: null };

        get.mockImplementation((sql, params, callback) => {
            callback(null, mockRow);
        });

        const result = await userService.getFavorites(1);
        expect(result).toEqual([]);
    });

    //Testing the getFavorites function with error
    test('should reject getFavorites on DB error', async () => {
        const mockError = new Error('DB Error');
        get.mockImplementation((sql, params, callback) => {
            callback(mockError);
        });

        await expect(userService.getFavorites(1)).rejects.toThrow(mockError);
    });

    // ------------------------------------------------------------------------
    // Tests for updateFavorites
    // ------------------------------------------------------------------------

    //Testing the updateFavorites function with success
    test('should update favorites for tags (default)', async () => {
        const favorites = [1, 2, 3];

        run.mockImplementation((sql, params, callback) => {
            callback(null);
        });

        await userService.updateFavorites(1, favorites);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE users SET favorites = ?'),
            [JSON.stringify(favorites), 1],
            expect.any(Function)
        );
    });

    //Testing the updateFavorites function with success
    test('should update favorites for css', async () => {
        const favorites = ['color', 'background'];

        run.mockImplementation((sql, params, callback) => {
            callback(null);
        });

        await userService.updateFavorites(1, favorites, 'css');

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE users SET favoritesCss = ?'),
            [JSON.stringify(favorites), 1],
            expect.any(Function)
        );
    });

    //Testing the updateFavorites function with error
    test('should reject updateFavorites on DB error', async () => {
        const mockError = new Error('Update Error');
        run.mockImplementation((sql, params, callback) => {
            callback(mockError);
        });

        await expect(userService.updateFavorites(1, [], 'tags')).rejects.toThrow(mockError);
    });
});