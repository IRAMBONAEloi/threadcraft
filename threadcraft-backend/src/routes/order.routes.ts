import { Router } from "express";
import * as orderController from '../controllers/order.controller';
import { authenticate } from "../middleware/auth";
import { verifyToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/database";
import { token } from "morgan";




const router = Router();




// Middleware to allow guests to checkout, but logged-in users to see their history



const optionalAuth = async (req: AuthRequest, _res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        if( authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = verifyToken(token);
            const user = await prisma.user.findUnique ({
                where: {id: payload.userId },
                select: {id: true, email: true, role: true },
            });

            if(user) req.user = user;
        }
        next();
    } catch (error) {
        next();
    }
};



// Checkout allows guests (if they send x-session-id) and logged-in users

router.post('/checkout', optionalAuth, orderController.checkout);


// These require the user to be logged in

router.get('/', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrder);


export default router;
