import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";


export function requireOwner(
     req: AuthRequest,
     _res: Response,
     next: NextFunction
): void {
    if (!req.user) {
        return next(new UnauthorizedError('Authentication required.'));

    }


    if (req.user.role !== 'OWNER') {
        return next(new ForbiddenError('Access denied. Owner privileges required.'));
    }

    next();
}