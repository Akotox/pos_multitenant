/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePricingPlanRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - currency
 *         - billingInterval
 *         - features
 *         - limits
 *       properties:
 *         name:
 *           type: string
 *           example: "Professional"
 *         description:
 *           type: string
 *           example: "Perfect for growing businesses"
 *         price:
 *           type: integer
 *           minimum: 0
 *           example: 2999
 *           description: "Price in cents"
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           example: "USD"
 *         billingInterval:
 *           type: string
 *           enum: [MONTHLY, YEARLY]
 *           example: "MONTHLY"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Advanced Analytics", "Multi-location Support"]
 *         limits:
 *           type: object
 *           required:
 *             - maxUsers
 *             - maxProducts
 *             - maxSalesPerMonth
 *           properties:
 *             maxUsers:
 *               type: integer
 *               minimum: 1
 *               example: 10
 *             maxProducts:
 *               type: integer
 *               minimum: 1
 *               example: 1000
 *             maxSalesPerMonth:
 *               type: integer
 *               minimum: 1
 *               example: 5000
 *     
 *     CreateSubscriptionRequest:
 *       type: object
 *       required:
 *         - planId
 *       properties:
 *         planId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         paymentMethodId:
 *           type: string
 *           example: "pm_1234567890"
 *         trialDays:
 *           type: integer
 *           minimum: 0
 *           maximum: 365
 *           example: 14
 *     
 *     UpdateSubscriptionRequest:
 *       type: object
 *       required:
 *         - planId
 *       properties:
 *         planId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         tenantId:
 *           type: string
 *         planId:
 *           type: string
 *         stripeSubscriptionId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, CANCELLED, PAST_DUE, UNPAID, TRIALING]
 *         currentPeriodStart:
 *           type: string
 *           format: date-time
 *         currentPeriodEnd:
 *           type: string
 *           format: date-time
 *         cancelAtPeriodEnd:
 *           type: boolean
 *         trialEnd:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

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

/**
 * @swagger
 * /api/v1/pricing/plans:
 *   get:
 *     summary: Get all pricing plans
 *     tags: [Pricing]
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter to show only active plans
 *     responses:
 *       200:
 *         description: Pricing plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PricingPlan'
 */
// Public routes - Pricing plans (for potential customers)
router.get('/plans', 
    query('activeOnly').optional().isBoolean().withMessage('activeOnly must be a boolean'),
    validateRequest,
    pricingController.getAllPricingPlans
);

/**
 * @swagger
 * /api/v1/pricing/plans/{id}:
 *   get:
 *     summary: Get pricing plan by ID
 *     tags: [Pricing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Pricing plan found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PricingPlan'
 *       404:
 *         description: Plan not found
 */
router.get('/plans/:id', 
    param('id').isMongoId().withMessage('Valid plan ID is required'),
    validateRequest,
    pricingController.getPricingPlanById
);

/**
 * @swagger
 * /api/v1/pricing/webhooks/stripe:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Pricing]
 *     description: Handles Stripe webhook events for subscription updates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature or payload
 */
// Webhook endpoint (must be before other middleware)
router.post('/webhooks/stripe', pricingController.handleStripeWebhook);

// Admin routes - Plan management
router.use('/admin', adminAuthMiddleware);

/**
 * @swagger
 * /api/v1/pricing/admin/plans:
 *   post:
 *     summary: Create a new pricing plan (Admin only)
 *     tags: [Pricing]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePricingPlanRequest'
 *     responses:
 *       201:
 *         description: Pricing plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PricingPlan'
 *       403:
 *         description: Insufficient permissions
 */
router.post('/admin/plans', 
    requirePermission(AdminPermission.MANAGE_PRICING),
    createPlanValidation,
    validateRequest,
    pricingController.createPricingPlan
);

/**
 * @swagger
 * /api/v1/pricing/admin/plans/{id}:
 *   put:
 *     summary: Update pricing plan (Admin only)
 *     tags: [Pricing]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *               billingInterval:
 *                 type: string
 *                 enum: [MONTHLY, YEARLY]
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PricingPlan'
 */
router.put('/admin/plans/:id', 
    requirePermission(AdminPermission.MANAGE_PRICING),
    param('id').isMongoId().withMessage('Valid plan ID is required'),
    updatePlanValidation,
    validateRequest,
    pricingController.updatePricingPlan
);

/**
 * @swagger
 * /api/v1/pricing/admin/plans/{id}:
 *   delete:
 *     summary: Delete pricing plan (Admin only)
 *     tags: [Pricing]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Plan deleted successfully
 */
router.delete('/admin/plans/:id', 
    requirePermission(AdminPermission.MANAGE_PRICING),
    param('id').isMongoId().withMessage('Valid plan ID is required'),
    validateRequest,
    pricingController.deletePricingPlan
);

/**
 * @swagger
 * /api/v1/pricing/subscription:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubscriptionRequest'
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid request or payment method
 */
// Tenant routes - Subscription management
router.use(auth()); // Require tenant authentication

router.post('/subscription', 
    createSubscriptionValidation,
    validateRequest,
    pricingController.createSubscription
);

/**
 * @swagger
 * /api/v1/pricing/subscription:
 *   get:
 *     summary: Get current subscription
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: No active subscription found
 */
router.get('/subscription', pricingController.getSubscription);

/**
 * @swagger
 * /api/v1/pricing/subscription:
 *   put:
 *     summary: Update subscription plan
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubscriptionRequest'
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 */
router.put('/subscription', 
    updateSubscriptionValidation,
    validateRequest,
    pricingController.updateSubscription
);

/**
 * @swagger
 * /api/v1/pricing/subscription/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelAtPeriodEnd:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to cancel at the end of the current period
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 */
router.post('/subscription/cancel', 
    body('cancelAtPeriodEnd').optional().isBoolean().withMessage('cancelAtPeriodEnd must be a boolean'),
    validateRequest,
    pricingController.cancelSubscription
);

/**
 * @swagger
 * /api/v1/pricing/subscription/reactivate:
 *   post:
 *     summary: Reactivate cancelled subscription
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 */
router.post('/subscription/reactivate', pricingController.reactivateSubscription);

/**
 * @swagger
 * /api/v1/pricing/usage:
 *   get:
 *     summary: Get current usage metrics
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentUsers:
 *                       type: integer
 *                     currentProducts:
 *                       type: integer
 *                     salesThisMonth:
 *                       type: integer
 *                     storageUsed:
 *                       type: number
 */
// Usage and billing routes
router.get('/usage', pricingController.getUsageMetrics);

/**
 * @swagger
 * /api/v1/pricing/usage/limits:
 *   get:
 *     summary: Check usage against plan limits
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage limits check
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         percentage:
 *                           type: number
 *                     products:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         percentage:
 *                           type: number
 */
router.get('/usage/limits', pricingController.checkUsageLimits);

/**
 * @swagger
 * /api/v1/pricing/billing/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/billing/history', 
    paginationValidation,
    validateRequest,
    pricingController.getPaymentHistory
);

/**
 * @swagger
 * /api/v1/pricing/billing/portal:
 *   post:
 *     summary: Create Stripe billing portal session
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - returnUrl
 *             properties:
 *               returnUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://yourapp.com/billing"
 *     responses:
 *       200:
 *         description: Billing portal session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://billing.stripe.com/session/..."
 */
router.post('/billing/portal', 
    body('returnUrl').isURL().withMessage('Valid return URL is required'),
    validateRequest,
    pricingController.createBillingPortalSession
);

export default router;