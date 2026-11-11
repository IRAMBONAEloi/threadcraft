import { z } from 'zod';



export const checkoutSchema = z.object({
    shippingAddress: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, ' State/Province is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        country: z.string().default('RW'), 
    }),
    paymentMethod: z.enum(['MOMO', 'AIRTEL_MONEY', 'BANK_TRANSFER', 'CASH', 'STRIPE']),
    guestEmail: z.string().email('Invalid email').optional(),
    guestPhone: z.string().min(10, 'Phone number is required').optional(),
    discountCode: z.string().optional(),
});



export type CheckoutInput = z.infer<typeof checkoutSchema>;