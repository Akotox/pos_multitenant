import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { BadRequestError } from '../errors/app-error';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error: ValidationError) => ({
            field: 'path' in error ? error.path : 'unknown',
            message: error.msg
        }));
        
        const badRequestError = new BadRequestError('Validation failed');
        (badRequestError as any).details = errorMessages;
        throw badRequestError;
    }
    
    next();
};