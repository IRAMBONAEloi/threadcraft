import { Router } from "express";
import * as adminController from '../controllers/admin.controller';
import { authenticate } from "../middleware/auth";
import { requireOwner } from "../middleware/admin";



const router = Router();

// ALL admin routes require the user to be logged in AND be the OWNER


router.use(authenticate, requireOwner);







router.get('/dashboard', adminController.getDashboard);
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);



export default router;