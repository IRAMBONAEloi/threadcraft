import { Request, Response, NextFunction} from 'express';
import {AppError, ValidationError } from '../utils/errors';


export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction

): void {
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.statusCode,
                details: err.errors,
            },
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.statusCode,
            },
        });
        return;
    }

    console.error('[Unexpected Error]', err);

    res.status(500).json({
        success: false,
        error: {
            message: 'Internal server error',
            code: 500,
        },
    });
}


export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.originalUrl} not found`,
            code: 404,
        },
    });
}