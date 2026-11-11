import { z } from 'zod';


export const addToCartSchema = z.object({
    variantId: z.string().min(1, 'Variant ID is required'),
    quantity: z.number().int().positive('Qunatity must be at least 1').default(1),
});


export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive('Quantity must be at 1'),
});


export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;