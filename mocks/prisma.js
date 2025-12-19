import { jest } from '@jest/globals';

const prismaMock = {
    tag: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
    },
    user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
    },
    attribute: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
    },
    attributeMetadata: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
    },
    property: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
    },
    propertyAttribute: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
    },
    $connect: jest.fn().mockResolvedValue(null),
    $disconnect: jest.fn().mockResolvedValue(null),
    $executeRawUnsafe: jest.fn().mockResolvedValue(0),
};

export default prismaMock;
