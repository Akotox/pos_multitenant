import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../application/register.usecase';
import { LoginUseCase } from '../application/login.usecase';
import { registerSchema, loginSchema } from './auth.dto';
import { emailNotificationService } from '../../../core/services/email/EmailNotificationService';

export class AuthController {
    constructor(
        private registerUseCase: RegisterUseCase,
        private loginUseCase: LoginUseCase
    ) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = registerSchema.parse(req.body);
            const result = await this.registerUseCase.execute(validatedData, req.tenantId);
            
            // Send welcome email based on registration type
            if (result) {
                try {
                    if (validatedData.tenantId) {
                        // New user added to existing tenant
                        await emailNotificationService.sendWelcomeUser({
                            email: validatedData.email,
                            userName: validatedData.name,
                            companyName: result.tenant?.name || 'Your Company',
                            userRole: result.user.role
                        });
                    } else {
                        // New tenant registration
                        await emailNotificationService.sendWelcomeTenant({
                            email: validatedData.email,
                            companyName: validatedData.tenantName || 'Your Company',
                            recipientName: validatedData.name,
                            planName: 'Trial'
                        });
                    }
                } catch (emailError) {
                    console.error('Failed to send welcome email:', emailError);
                    // Don't fail the registration if email fails
                }
            }
            
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
