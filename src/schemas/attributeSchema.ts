import { z } from 'zod';

export const attributeMetadataSchema = z.object({
    attributeName: z.string()
        .min(1, 'Attribute name is required')
        .max(50, 'Attribute name must be less than 50 characters')
        .trim(),
    generalDescription: z.string()
        .min(1, 'General description is required')
        .trim()
});

export const attributeSchema = z.object({
    tagId: z.number().int().positive('Tag ID must be a positive integer'),
    attributes: z.array(z.object({
        attribute: z.string().trim(),
        info: z.string().trim()
    })).min(1, 'At least one attribute is required')
});

export type AttributeMetadataInput = z.infer<typeof attributeMetadataSchema>;
export type AttributeInput = z.infer<typeof attributeSchema>;
