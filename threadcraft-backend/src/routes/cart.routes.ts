import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';



const router = Router();

// We want to allow guests, so we DO NOT put `authenticate` on the whole router.
// Instead, we use a custom middleware that checks if a token exists, and if it does,
// it decodes it, but if it doesn't, it just lets the request pass through.

// Since we haven't built that "optional" middleware yet, we will do it inline here.

import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';



const optionalAuth = async (req: AuthRequest, _res: any, next: any) =>{
    try {
        const authHeader = req.headers.authorization;
        if(authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = verifyToken(token);
            const user = await prisma.user.findUnique({
                where: { id: payload.userId},
                select: { id: true, email: true, role: true},
            });

            if (user) req.user = user;
        }
        next();
    } catch (error) {

         // If token is invalid, we just ignore it and treat them as a guest
        next();
    }
};

// Apply this to all cart routes
router.use(optionalAuth);


router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeCartItem);



export default router;
