import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../application/register.usecase';
import { LoginUseCase } from '../application/login.usecase';
import { registerSchema, loginSchema } from './auth.dto';

export class AuthController {
    constructor(
        private registerUseCase: RegisterUseCase,
        private loginUseCase: LoginUseCase
    ) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = registerSchema.parse(req.body);
            const result = await this.registerUseCase.execute(validatedData, req.tenantId);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await this.loginUseCase.execute(validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
