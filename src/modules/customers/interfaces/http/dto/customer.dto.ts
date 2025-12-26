import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
