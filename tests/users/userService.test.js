import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the Prisma dependency
jest.unstable_mockModule('../../db/prisma.js', () => {
    return import('../../mocks/prisma.js');
});

// Mock bcrypt dependency
jest.unstable_mockModule('bcrypt', () => ({
    default: {
        hash: jest.fn(),
        compare: jest.fn()
    }
}));

const { default: prisma } = await import('../../db/prisma.js');
const { default: bcrypt } = await import('bcrypt');
const { default: userService } = await import('../../services/users/userService.js');

// Mock Data
const mockUserLogin = {
    id: 1,
    username: 'terwy54',
    email: 'terwy54@gmail.com',
    password: "$2b$10$JmTs2qnmpOMwcAjt.RUhyurYfnmy1q5a6ssJ1FPwdEc6gsr/guC6S",
    admin: 0,
    photo: '/uploads/users/cat_default.webp',
    favorites: '[]',
    favoritesCss: '[]'
};

describe("userService Unit Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return user data on successful login with username', async () => {
        prisma.user.findFirst.mockResolvedValue(mockUserLogin);

        const result = await userService.findByLogin(mockUserLogin.username);

        expect(prisma.user.findFirst).toHaveBeenCalled();
        expect(result).toEqual(mockUserLogin);
    });

    test('should return user data on successful login with email', async () => {
        prisma.user.findFirst.mockResolvedValue(mockUserLogin);

        const result = await userService.findByLogin(mockUserLogin.email);

        expect(prisma.user.findFirst).toHaveBeenCalled();
        expect(result).toEqual(mockUserLogin);
    });

    test('should create a new user and return the inserted ID', async () => {
        const mockId = 123;
        const hashedPassword = 'hashed_password_mock';
        bcrypt.hash.mockResolvedValue(hashedPassword);
        prisma.user.create.mockResolvedValue({ id: mockId });

        const result = await userService.createUser('newUser', 'new@example.com', 'plainPassword', 0);

        expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
        expect(prisma.user.create).toHaveBeenCalled();
        expect(result).toBe(mockId);
    });

    test('should update user photo successfully', async () => {
        prisma.user.update.mockResolvedValue({});
        await userService.updatePhoto(1, '/path.jpg');
        expect(prisma.user.update).toHaveBeenCalled();
    });

    test('should return user by id', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUserLogin);
        const result = await userService.findById(1);
        expect(result).toEqual(mockUserLogin);
    });

    test('should return parsed favorites for tags', async () => {
        const mockFavorites = [1, 2, 3];
        prisma.user.findUnique.mockResolvedValue({
            favorites: JSON.stringify(mockFavorites)
        });

        const result = await userService.getFavorites(1);
        expect(result).toEqual(mockFavorites);
    });

    test('should update favorites for tags', async () => {
        const favorites = [1, 2, 3];
        prisma.user.update.mockResolvedValue({});
        await userService.updateFavorites(1, favorites);
        expect(prisma.user.update).toHaveBeenCalled();
    });
});