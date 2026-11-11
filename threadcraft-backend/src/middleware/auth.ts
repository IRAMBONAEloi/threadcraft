import {Request, Response, NextFunction} from 'express';
import { verifyToken, JwtPayload, } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import {prisma} from '../config/database';

declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            role: string;
        }
    }
}
export interface AuthRequest extends Request {
    user?: Express.User;
       
    }




export async function authenticate(
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try{
         const authHeader = req.headers.authorization;

         

         if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new UnauthorizedError('Authorization required. Please log in.');
         }


         const token = authHeader.split(' ')[1];
         const payload = verifyToken(token) as JwtPayload;

         const user = await prisma.user.findUnique({
            where: {id: payload.userId},
            select: {id: true, email: true, role: true, tokenVersion: true},
         });


         if(!user) {
            throw new UnauthorizedError ('User account no longer exists.');

         }


         if(payload.tokenVersion !== user.tokenVersion) {
            throw new UnauthorizedError('Session expired. Please log in again.');
         }

         req.user = user;
         next();
    }catch (error){
        next(error);
    }
}


export function requireRole (...allowedRoles: string[]){
    return (req:AuthRequest, _res:Response, next: NextFunction): void =>{
        if(!req.user) {
            return next(new UnauthorizedError('Authorization required.'));
        }

        if (!allowedRoles.includes(req.user.role)){
            return next(
                new ForbiddenError('You do not have permission to perform this action.')
            );
        }
        next();
    };
}