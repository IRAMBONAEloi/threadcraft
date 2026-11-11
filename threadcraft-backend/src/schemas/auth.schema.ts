import { z } from 'zod';


export const registerSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long'),
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name too long')
        .trim(),
    lastName: z
        .string()
        .min(1, 'Lat name is required')
        .max(50, 'Lat name is too long')
        .trim(),
    language: z
        .enum(['en', 'rw'])
        .optional()
        .default('en'),
});



export const loginSchema= z.object({
    email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
    password: z
    .string()
    .min(1, 'Password is required'),
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;