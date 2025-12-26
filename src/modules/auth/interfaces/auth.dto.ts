import { z } from 'zod';

export const registerSchema = z.object({
    tenantName: z.string().min(2).optional(),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    tenantId: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    tenantId: z.string().optional(), // In some multi-tenant apps, tenantId is required if same email can exist across tenants
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
