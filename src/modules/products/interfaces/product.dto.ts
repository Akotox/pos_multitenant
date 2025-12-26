import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().min(0),
    buyingPrice: z.number().min(0),
    imageUrl: z.string().url().optional(),
    categoryId: z.string(),
    stockQuantity: z.number().optional().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
