import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { checkoutSchema } from '../schemas/order.schema';
import { ValidationError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';


export async function checkout(
    req:AuthRequest,
    res: Response,
    next:NextFunction
): Promise<void> {
    try {
        const validation = checkoutSchema.safeParse(req.body);


        if (!validation.success) {
            const errors: Record<string, string[]> = {};
            validation.error.issues.forEach((err) => {
                const path = err.path.join('.');
                if(!errors[path]) errors[path] = [];
                    errors[path].push(err.message);
            });
            throw new ValidationError('Validation failed', errors);
        }

        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] as string | undefined;


        const order = await orderService.checkout(validation.data, userId, sessionId);


        res.status(200).json({
            success: true,
            data: { order },
        });
    } catch (error) {
        next(error);
    }
}


export async function getMyOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new Error('User nor authenticated');
        }

        const orders = await orderService.getOrders(req.user.id);


        res.status(200).json({
            success: true,
            data: { orders },
        });
    } catch(error) {
        next(error);
    }
}



export async function getOrder (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new Error ('uUser not authenticated');
        }


        const { id } = req.params;
        const order = await orderService.getOrderById(id, req.user.id);


        res.status(200).json({
            success: true,
            data: [ order ],

        });
    } catch(error) {
        next(error);
    }
}