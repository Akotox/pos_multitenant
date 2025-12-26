import { z } from 'zod';
import { PaymentMethod } from '../infrastructure/sale.model';

export const saleItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().positive(),
});

export const createSaleSchema = z.object({
    items: z.array(saleItemSchema).min(1),
    paymentMethod: z.nativeEnum(PaymentMethod),
    customerId: z.string().optional(),
});

export type CreateSaleDto = z.infer<typeof createSaleSchema>;
