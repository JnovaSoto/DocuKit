import { z } from 'zod';

export const propertySchema = z.object({
    propertyName: z.string()
        .min(1, 'Property name is required')
        .max(50, 'Property name must be less than 50 characters')
        .trim(),
    usability: z.string()
        .min(1, 'Usability description is required')
        .trim(),
    content: z.string()
        .trim()
        .optional()
});

export const updatePropertySchema = propertySchema.extend({
    attributes: z.array(z.object({
        attribute: z.string().trim(),
        info: z.string().trim()
    })).optional()
});

export type PropertyInput = z.infer<typeof propertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
