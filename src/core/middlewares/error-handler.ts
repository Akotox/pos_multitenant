import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
                code: issue.code
            }))
        });
    }

    // Handle custom app errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    console.error('Unexpected error:', err);

    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};
