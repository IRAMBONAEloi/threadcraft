import  { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';
import { addToCartSchema, updateCartItemSchema } from '../schemas/cart.schema';
import { ValidationError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';


//helper to extract userId and sessionId from the request


function getCartIdentity( req: AuthRequest) {
    return {
        userId: req.user?.id,
        sessionId: req.headers ['x-session-id'] as string | undefined,
    };
}


export async function getCart(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
         const { userId, sessionId } = getCartIdentity(req);
         const cart = await cartService.getCart( userId, sessionId );


         res.status(200).json({
            success: true,
            data: { cart },
         });
    } catch (error) {
        next(error) 
    }
}


export async function addToCart(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const validation = addToCartSchema.safeParse(req.body);

        if (!validation.success) {
            const errors: Record<string, string[]> = {};
            validation.error.issues.forEach((err) => {
                const path = err.path.join ('.');
                if(!errors[path]) errors[path] = [];
                errors[path].push(err.message);
            });

            throw new ValidationError('Validation failed', errors);
        }


        const { userId, sessionId } =getCartIdentity(req);

        if(!userId && !sessionId) {
            throw new ValidationError('Must provide x-session=id header for guests or be logged in');
        }

        const cart = await cartService.addToCart(validation.data, userId, sessionId);

        res.status(200).json({
            success: true,
            data: { cart },
        });

    } catch (error) {
        next(error);
    }

}


export async function updateCartItem(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void>{
    try{
        const validation = updateCartItemSchema.safeParse(req.body);

        if (!validation.success) {
            const errors: Record<string, string[]> = {};
            validation.error?.issues.forEach((err) =>{
                const path = err.path.join ('.');
                if(!errors[path]) errors[path] =[];
                errors[path].push(err.message);
            });
            throw new ValidationError('Validation failed ', errors);
        }

        const { itemId } = req.params;
        const { userId, sessionId } = getCartIdentity(req);

        const cart =  await cartService.updateCartItemQuantity(
            itemId,
            validation.data.quantity,
            userId,
            sessionId
        );

        res.status(200).json({
            success: true,
            data: { cart },
        });
        
    } catch (error) {
        next(error)
    }
}


    export async function removeCartItem(
        req: Request,
        res: Response,
        next:NextFunction
    ): Promise<void> {
        try {
            const { itemId } = req.params
            const { userId, sessionId } = getCartIdentity(req);


            const cart =await cartService.removeCartItem(itemId, userId, sessionId);

            res.status(200).json({
                success: true,
                data: { cart },
            });
        } catch (error) {
            next(error);
        }
    }