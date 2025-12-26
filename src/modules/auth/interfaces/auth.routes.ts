import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '../application/register.usecase';
import { LoginUseCase } from '../application/login.usecase';
import { AuthRepository } from '../infrastructure/auth.repository.impl';
import { SubscriptionRepositoryImpl } from '../../payments/infrastructure/database/repositories/SubscriptionRepositoryImpl';
import { auth } from '../../../core/middlewares/auth';
import { UserRole } from '../infrastructure/user.model';

const authRepository = new AuthRepository();
const subscriptionRepository = new SubscriptionRepositoryImpl();
const registerUseCase = new RegisterUseCase(authRepository, subscriptionRepository);
const loginUseCase = new LoginUseCase(authRepository);
const authController = new AuthController(registerUseCase, loginUseCase);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and tenant registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new tenant or user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               tenantId:
 *                 type: string
 *                 description: Optional. Only for adding users to existing tenant (Owner/Manager only).
 *               companyName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation error or User already exists
 */

router.post('/register', (req: Request, res: Response, next: NextFunction) => {
    if (req.body.tenantId) {
        return auth([UserRole.OWNER, UserRole.MANAGER])(req, res, next);
    }
    next();
}, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               tenantId:
 *                 type: string
 *                 description: Optional. Required if user belongs to multiple tenants.
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

export default router;
