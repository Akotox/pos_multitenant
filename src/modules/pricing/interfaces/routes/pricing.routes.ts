import { Router } from 'express';
import { PricingController } from '../controllers/PricingController';
import { PricingUseCases } from '../../application/usecases/PricingUseCases';
import { PricingRepositoryImpl } from '../../infrastructure/repositories/PricingRepositoryImpl';
import { StripeService } from '../../infrastructure/services/StripeService';
import { auth } from '../../../../core/middlewares/auth';
import { adminAuthMiddleware, requirePermission } from '../../../admin/interfaces/middlewares/adminAuth.middleware';
import { AdminPermission } from '../../../admin/domain/entities/Admin';
import { validateRequest } from '../../../../core/middlewares/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Dependencies
const pricingRepository = new PricingRepositoryImpl();
const stripeService = new StripeService();
const pricingUseCases = new PricingUseCases(pricingRepository, stripeService);
const pricingController = new PricingController(pricingUseCases);

// Validation schemas
const createPlanValidation = [
    body('name').notEmpty().withMessage('Plan name is required'),
    body('description').notEmpty().withMessage('Plan description is required'),
    body('price').isInt({ min: 0 }).withMessage('Price must be a positive integer (in cents)'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('billingInterval').isIn(['MONTHLY', 'YEARLY']).withMessage('Billing interval must be MONTHLY or YEARLY'),
    body('features').isArray().withMessage('Features must be an array'),
    body('limits').isObject().withMessage('Limits must be an object'),
    body('limits.maxUsers').isInt({ min: 1 }).withMessage('Max users must be a positive integer'),
    body('limits.maxProducts').isInt({ min: 1 }).withMessage('Max products must be a positive integer'),
    body('limits.maxSalesPerMonth').isInt({ min: 1 }).withMessage('Max sales per month must be a positive integer')
];

const updatePlanValidation = [
    body('name').optional().notEmpty().withMessage('Plan name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Plan description cannot be empty'),
    body('price').optional().isInt({ min: 0 }).withMessage('Price must be a positive integer (in cents)'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('billingInterval').optional().isIn(['MONTHLY', 'YEARLY']).withMessage('Billing interval must be MONTHLY or YEARLY')
];

const createSubscriptionValidation = [
    body('planId').isMongoId().withMessage('Valid plan ID is required'),
    body('paymentMethodId').optional().isString().withMessage('Payment method ID must be a string'),
    body('trialDays').optional().isInt({ min: 0, max: 365 }).withMessage('Trial days must be between 0 and 365')
];

const updateSubscriptionValidation = [
    body('planId').isMongoId().withMessage('Valid plan ID is required')
];

const paginationValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Public routes - Pricing plans (for potential customers)
router.get('/plans', 
    query('activeOnly').optional().isBoolean().withMessage('activeOnly must be a boolean'),
    validateRequest,
    pricingController.getAllPricingPlans
);

router.get('/plans/:id', 
    param('id').isMongoId().withMessage('Valid plan ID is required'),
    validateRequest,
    pricingController.getPricingPlanById
);

// Webhook endpoint (must be before other middleware)
router.post('/webhooks/stripe', pricingController.handleStripeWebhook);

// Admin routes - Plan management
router.use('/admin', adminAuthMiddleware);

router.post('/admin/plans', 
    requirePermission(AdminPermission.MANAGE_PRICING),
    createPlanValidation,
    validateRequest,
    pricingController.createPricingPlan
);

router.put('/admin/plans/:id', 
    requirePermission(AdminPermission.MANAGE_PRICING),
    param('id').isMongoId().withMessage('Valid plan ID is required'),
    updatePlanValidation,
    validateRequest,
    pricingController.updatePricingPlan
);

router.delete('/admin/plans/:id', 
    requirePermission(AdminPermission.MANAGE_PRICING),
    param('id').isMongoId().withMessage('Valid plan ID is required'),
    validateRequest,
    pricingController.deletePricingPlan
);

// Tenant routes - Subscription management
router.use(auth()); // Require tenant authentication

router.post('/subscription', 
    createSubscriptionValidation,
    validateRequest,
    pricingController.createSubscription
);

router.get('/subscription', pricingController.getSubscription);

router.put('/subscription', 
    updateSubscriptionValidation,
    validateRequest,
    pricingController.updateSubscription
);

router.post('/subscription/cancel', 
    body('cancelAtPeriodEnd').optional().isBoolean().withMessage('cancelAtPeriodEnd must be a boolean'),
    validateRequest,
    pricingController.cancelSubscription
);

router.post('/subscription/reactivate', pricingController.reactivateSubscription);

// Usage and billing routes
router.get('/usage', pricingController.getUsageMetrics);

router.get('/usage/limits', pricingController.checkUsageLimits);

router.get('/billing/history', 
    paginationValidation,
    validateRequest,
    pricingController.getPaymentHistory
);

router.post('/billing/portal', 
    body('returnUrl').isURL().withMessage('Valid return URL is required'),
    validateRequest,
    pricingController.createBillingPortalSession
);

export default router;