import { z } from 'zod';

// More lenient email validation
const emailSchema = z.string()
    .min(1, "Email is required")
    .refine((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }, "Invalid email format");

export const registerSchema = z.object({
    tenantName: z.string().min(2).optional(),
    name: z.string().min(2),
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters long"),
    tenantId: z.string().optional(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters long"),
    tenantId: z.string().optional(), // In some multi-tenant apps, tenantId is required if same email can exist across tenants
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
