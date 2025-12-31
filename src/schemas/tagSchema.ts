import { z } from 'zod';

export const tagSchema = z.object({
    tagName: z.string()
        .min(1, 'Tag name is required')
        .max(50, 'Tag name must be less than 50 characters')
        .trim(),
    usability: z.string()
        .min(1, 'Usability description is required')
        .trim(),
    content: z.string()
        .trim()
        .optional()
});

export const updateTagSchema = tagSchema.extend({
    attributes: z.array(z.object({
        attribute: z.string().trim(),
        info: z.string().trim()
    })).optional()
});

export type TagInput = z.infer<typeof tagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
