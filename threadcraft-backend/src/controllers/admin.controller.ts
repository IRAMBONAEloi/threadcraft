import { Response, NextFunction, response } from "express";
import * as adminService from '../services/admin.service';
import { authenticate, AuthRequest } from "../middleware/auth";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { REFUSED } from "dns";




export async function getDashboard(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const stats = await adminService.getDashboardStats();
        res.status(200).json({ 
            success: true, 
            data: stats 
        });
    } catch (error) {
        next(error);
    }
}



export async function getAllOrders(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const orders = await adminService.getAllOrders();
        res.status(200).json({
            success: true,
            data: { orders }
        });
    }catch (error) {
        next(error);
    }
}



export async function updateOrderStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const { status, paymentStatus, note} = req.body;

         


        if (!status || !paymentStatus ) {
            throw new Error ('Status and paymentStatus are required');
        }


        const result = await adminService.updateOrderStatus(
            id,
            status as OrderStatus,
            paymentStatus as PaymentStatus,
            note
        );


        res.status(200).json({
            success: true, 
            data: result 
        });
    } catch (error) {
        next(error);
    }
}