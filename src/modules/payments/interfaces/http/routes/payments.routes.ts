import { Router } from 'express';
import { PaymentsController } from '../controllers/PaymentsController';
import { ProcessSubscriptionPaymentUseCase } from '../../../application/use-cases/ProcessSubscriptionPaymentUseCase';
import { SubscriptionRepositoryImpl } from '../../../infrastructure/database/repositories/SubscriptionRepositoryImpl';
import { PaymentRepositoryImpl } from '../../../infrastructure/database/repositories/PaymentRepositoryImpl';
import { auth } from '../../../../../core/middlewares/auth';
import { UserRole } from '../../../../auth/infrastructure/user.model';

const subscriptionRepository = new SubscriptionRepositoryImpl();
const paymentRepository = new PaymentRepositoryImpl();
const processPaymentUseCase = new ProcessSubscriptionPaymentUseCase(subscriptionRepository, paymentRepository);
const paymentsController = new PaymentsController(processPaymentUseCase, subscriptionRepository);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Subscription management
 */

router.use(auth());

/**
 * @swagger
 * /payments/subscription:
 *   get:
 *     summary: Get current subscription status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 */
router.get('/subscription', paymentsController.getSubscription);

/**
 * @swagger
 * /payments/renew:
 *   post:
 *     summary: Manually renew subscription (Owner only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription renewed successfully
 *       403:
 *         description: Forbidden (Not Owner)
 */
router.post('/renew', auth([UserRole.OWNER]), paymentsController.renew);

export default router;
