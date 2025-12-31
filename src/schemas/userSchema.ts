import { z } from 'zod';

export const loginSchema = z.object({
    login: z.string().min(1, 'Login (username or email) is required').trim(),
    password: z.string().min(1, 'Password is required').trim()
});

export const signUpSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .trim(),
    email: z.string()
        .email('Invalid email format')
        .max(40, 'Email must be less than 40 characters')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .trim(),
    admin: z.union([z.number(), z.boolean(), z.string()])
        .transform((val) => {
            if (typeof val === 'boolean') return val ? 1 : 0;
            if (typeof val === 'string') return val === 'true' || val === '1' ? 1 : 0;
            return val;
        }),
    googleId: z.string().optional().default('local')
});

export const favoriteSchema = z.object({
    tagId: z.coerce.number().int().positive('Tag ID must be a positive integer')
});

export const cssFavoriteSchema = z.object({
    propertyId: z.coerce.number().int().positive('Property ID must be a positive integer')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type CssFavoriteInput = z.infer<typeof cssFavoriteSchema>;
