import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth.service';
import {registerSchema, loginSchema} from '../schemas/auth.schema';
import {UnauthorizedError, ValidationError, BadRequestError} from '../utils/errors';
import {AuthRequest} from '../middleware/auth';
import { signToken } from "../utils/jwt";
import { prisma } from "../config/database";



export async function register (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try{
        const validation =  registerSchema.safeParse(req.body);

        if (!validation.success) {
            const errors: Record<string, string[]> = {};
            validation.error.issues.forEach((err) => {
                const path = err.path.join('.');
                if (!errors[path]) errors[path] = [];
                errors[path].push(err.message);
            });

            throw new ValidationError('Validation failed', errors);
        }


        const {user, token} = await authService.registerUser(validation.data);

        res.status(201).json({
            success:true,
            data: {user, token},
        });
    }catch (error){
        next(error);
    }
}



export async function login (
    req:Request,
    res: Response,
    next: NextFunction
):Promise<void> {
    try{
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success){
            const errors: Record<string, string[]> ={};
            validation.error.issues.forEach((err) =>{
                const path = err.path.join('.');
                if (!errors[path]) errors[path] = [];
                errors[path].push(err.message);
            });

            throw new ValidationError('Validation failed', errors);
        }
        const sessionId = req.headers['x-session-id'] as string | undefined;
        const  result = await authService.loginUser(validation.data, sessionId);


        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}


export async function getMe(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void>  {
    try{
        if(!req.user) {
            throw new Error ('User not attached to request');
        }


        const user = await authService.getUserById(req.user.id);

        res.status(200).json({
            success: true,
            data:( user ),
        });
    } catch (error) {
        next( error)

        }
}

export async function googleCallback (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try{
        const passportUser = req.user ;


        if (!passportUser) {
            res.status(200).json({
                success: false, 
                error: { message: 'Google authentication failed', code: 401}
            });
            return;
        }



        const user = await prisma.user.findUnique({
            where: { id: passportUser.id },
        });

        if (!user) {
            res.status(401).json({ success: false, error:  { message: 'User not found', code: 401}});
            return;
        }


        const token = signToken ({
            userId: user.id,
            role: user.role,
            tokenVersion: user.tokenVersion,
        });




        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
        next(error);
    }
}



export async function logout(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if(!req.user) throw new UnauthorizedError('Not authenticated');
        await authService.logoutUser(req.user.id);
        res.status(200).json({
            success: true,
            data: { message: 'Logged out from all devices'}
        });
    } catch (error) {
        next(error);
    }
}


export async function setup2FA(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) : Promise<void> {
    try {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        } 
        const result = await authService.generate2FASecret(req.user.id);
        res.status(200).json({
            success: true, 
            data: result,
        });
    }
    catch (error){
        next(error);
    }
}


export async function verify2FA(
    req: Request,
    res: Response,
    next: NextFunction,
) : Promise<void>{
    try{
        const {userId, code } = req.body;

        if(!userId || !code){
            throw new BadRequestError('userId and code are required');
        }
        const sessionId = req.headers['x-session-id'] as string | undefined;
        const result = await authService.verify2FALogin(userId, code, sessionId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error){
        next(error);
    }
}