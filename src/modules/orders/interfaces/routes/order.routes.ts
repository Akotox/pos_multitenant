/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *         - billingAddress
 *       properties:
 *         customerId:
 *           type: string
 *           description: Customer ID
 *           example: "507f1f77bcf86cd799439011"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           minItems: 1
 *         billingAddress:
 *           $ref: '#/components/schemas/Address'
 *         shippingAddress:
 *           $ref: '#/components/schemas/Address'
 *         paymentTerms:
 *           $ref: '#/components/schemas/PaymentTerms'
 *         priority:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, URGENT, CRITICAL]
 *           default: NORMAL
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         expectedDeliveryDate:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *     
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING_APPROVAL, APPROVED, CONFIRMED, IN_PRODUCTION, READY_TO_SHIP, SHIPPED, DELIVERED, COMPLETED, CANCELLED, ON_HOLD, RETURNED]
 *         reason:
 *           type: string
 *         notes:
 *           type: string
 *     
 *     RecordPaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - paymentMethod
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 0.01
 *         paymentMethod:
 *           type: string
 *           enum: [CASH, CARD, BANK_TRANSFER, CHECK, CREDIT_ACCOUNT, FINANCING]
 *         notes:
 *           type: string
 *     
 *     OrderTemplate:
 *       type: object
 *       required:
 *         - name
 *         - items
 *         - paymentTerms
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         paymentTerms:
 *           $ref: '#/components/schemas/PaymentTerms'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *     
 *     BulkOperationRequest:
 *       type: object
 *       required:
 *         - type
 *         - orderIds
 *         - parameters
 *       properties:
 *         type:
 *           type: string
 *           enum: [UPDATE_STATUS, UPDATE_PRIORITY, SEND_NOTIFICATIONS, EXPORT_ORDERS, APPLY_DISCOUNT, UPDATE_PAYMENT_TERMS]
 *         orderIds:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         parameters:
 *           type: object
 */

import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { OrderUseCases } from '../../application/usecases/OrderUseCases';
import { OrderRepositoryImpl } from '../../infrastructure/repositories/OrderRepositoryImpl';
import { auth } from '../../../../core/middlewares/auth';
import { UserRole } from '../../../auth/infrastructure/user.model';
import { validateRequest } from '../../../../core/middlewares/validation.middleware';
import { checkSubscriptionLimits, checkFeatureAccess } from '../../../pricing/interfaces/middlewares/subscriptionLimits.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Dependencies
const orderRepository = new OrderRepositoryImpl();
const orderUseCases = new OrderUseCases(orderRepository);
const orderController = new OrderController(orderUseCases);

// Validation schemas
const createOrderValidation = [
    body('customerId').isMongoId().withMessage('Valid customer ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
    body('items.*.name').notEmpty().withMessage('Product name is required for each item'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
    body('billingAddress').isObject().withMessage('Billing address is required'),
    body('billingAddress.street').notEmpty().withMessage('Street address is required'),
    body('billingAddress.city').notEmpty().withMessage('City is required'),
    body('billingAddress.state').notEmpty().withMessage('State is required'),
    body('billingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    body('billingAddress.country').notEmpty().withMessage('Country is required'),
    body('paymentTerms').optional().isObject().withMessage('Payment terms must be an object'),
    body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).withMessage('Invalid priority'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('expectedDeliveryDate').optional().isISO8601().withMessage('Invalid delivery date format'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

const updateOrderValidation = [
    body('items').optional().isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').optional().notEmpty().withMessage('Product ID is required for each item'),
    body('items.*.name').optional().notEmpty().withMessage('Product name is required for each item'),
    body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
    body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).withMessage('Invalid priority'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('expectedDeliveryDate').optional().isISO8601().withMessage('Invalid delivery date format'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

const updateStatusValidation = [
    body('status').isIn([
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'IN_PRODUCTION',
        'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'RETURNED'
    ]).withMessage('Invalid order status'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

const recordPaymentValidation = [
    body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
    body('paymentMethod').isIn(['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'CREDIT_ACCOUNT', 'FINANCING']).withMessage('Invalid payment method'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

const approvalValidation = [
    body('comments').optional().isString().withMessage('Comments must be a string')
];

const rejectValidation = [
    body('reason').notEmpty().withMessage('Rejection reason is required')
];

const createTemplateValidation = [
    body('name').notEmpty().withMessage('Template name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('paymentTerms').isObject().withMessage('Payment terms are required'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
];

const bulkOperationValidation = [
    body('type').isIn(['UPDATE_STATUS', 'UPDATE_PRIORITY', 'SEND_NOTIFICATIONS', 'EXPORT_ORDERS', 'APPLY_DISCOUNT', 'UPDATE_PAYMENT_TERMS']).withMessage('Invalid operation type'),
    body('orderIds').isArray({ min: 1 }).withMessage('At least one order ID is required'),
    body('orderIds.*').isMongoId().withMessage('Invalid order ID format'),
    body('parameters').isObject().withMessage('Parameters must be an object')
];

const paginationValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isString().withMessage('Sort by must be a string'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// All routes require authentication
router.use(auth());

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Subscription limit exceeded
 */
// Basic CRUD Operations
router.post('/', 
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    checkSubscriptionLimits('sales'),
    createOrderValidation,
    validateRequest,
    orderController.createOrder
);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders with pagination
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                     $ref: '#/components/schemas/Order'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    paginationValidation,
    validateRequest,
    orderController.getOrders
);

/**
 * @swagger
 * /api/v1/orders/search:
 *   get:
 *     summary: Search orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
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
 *         description: Search results
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
 *                     $ref: '#/components/schemas/Order'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/search',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    query('q').notEmpty().withMessage('Search term is required'),
    paginationValidation,
    validateRequest,
    orderController.searchOrders
);

/**
 * @swagger
 * /api/v1/orders/metrics:
 *   get:
 *     summary: Get order metrics and analytics
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for metrics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for metrics
 *     responses:
 *       200:
 *         description: Order metrics
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
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     statusBreakdown:
 *                       type: object
 *       403:
 *         description: Feature not available in current plan
 */
router.get('/metrics',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    checkFeatureAccess('advancedAnalytics'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    validateRequest,
    orderController.getOrderMetrics
);

/**
 * @swagger
 * /api/v1/orders/overdue:
 *   get:
 *     summary: Get overdue orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue orders
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
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/overdue',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    orderController.getOverdueOrders
);

/**
 * @swagger
 * /api/v1/orders/due-today:
 *   get:
 *     summary: Get orders due today
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders due today
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
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/due-today',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    orderController.getOrdersDueToday
);

/**
 * @swagger
 * /api/v1/orders/pending-approval:
 *   get:
 *     summary: Get orders pending approval
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders pending approval
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
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/pending-approval',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    orderController.getPendingApprovalOrders
);

/**
 * @swagger
 * /api/v1/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/number/:orderNumber',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('orderNumber').notEmpty().withMessage('Order number is required'),
    validateRequest,
    orderController.getOrderByNumber
);

/**
 * @swagger
 * /api/v1/orders/customer/{customerId}:
 *   get:
 *     summary: Get orders by customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
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
 *         description: Customer orders
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
 *                     $ref: '#/components/schemas/Order'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/customer/:customerId',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('customerId').isMongoId().withMessage('Valid customer ID is required'),
    paginationValidation,
    validateRequest,
    orderController.getOrdersByCustomer
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/:id',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    validateRequest,
    orderController.getOrderById
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH, URGENT, CRITICAL]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.put('/:id',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    updateOrderValidation,
    validateRequest,
    orderController.updateOrder
);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
router.put('/:id/status',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    updateStatusValidation,
    validateRequest,
    orderController.updateOrderStatus
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
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
 *                   example: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/:id',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    validateRequest,
    orderController.deleteOrder
);

/**
 * @swagger
 * /api/v1/orders/{id}/payments:
 *   post:
 *     summary: Record a payment for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
// Payment Management
router.post('/:id/payments',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    recordPaymentValidation,
    validateRequest,
    orderController.recordPayment
);

/**
 * @swagger
 * /api/v1/orders/{id}/approve:
 *   post:
 *     summary: Approve an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 description: Approval comments
 *     responses:
 *       200:
 *         description: Order approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
// Approval Workflow
router.post('/:id/approve',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    approvalValidation,
    validateRequest,
    orderController.approveOrder
);

/**
 * @swagger
 * /api/v1/orders/{id}/reject:
 *   post:
 *     summary: Reject an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Rejection reason
 *     responses:
 *       200:
 *         description: Order rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
router.post('/:id/reject',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    rejectValidation,
    validateRequest,
    orderController.rejectOrder
);

/**
 * @swagger
 * /api/v1/orders/templates:
 *   post:
 *     summary: Create an order template
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderTemplate'
 *     responses:
 *       201:
 *         description: Template created successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 */
// Templates
router.post('/templates',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    createTemplateValidation,
    validateRequest,
    orderController.createTemplate
);

/**
 * @swagger
 * /api/v1/orders/templates/list:
 *   get:
 *     summary: Get all order templates
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
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
 *                     $ref: '#/components/schemas/OrderTemplate'
 */
router.get('/templates/list',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    orderController.getTemplates
);

/**
 * @swagger
 * /api/v1/orders/templates/{templateId}/create-order:
 *   post:
 *     summary: Create order from template
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID
 *     responses:
 *       201:
 *         description: Order created from template successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
router.post('/templates/:templateId/create-order',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('templateId').isMongoId().withMessage('Valid template ID is required'),
    body('customerId').isMongoId().withMessage('Valid customer ID is required'),
    validateRequest,
    orderController.createOrderFromTemplate
);

/**
 * @swagger
 * /api/v1/orders/bulk-operations:
 *   post:
 *     summary: Perform bulk operations on orders (Enterprise Feature)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkOperationRequest'
 *     responses:
 *       200:
 *         description: Bulk operation initiated successfully
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
 *                     operationId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "PROCESSING"
 *       403:
 *         description: Feature not available in current plan
 */
// Bulk Operations (Enterprise Feature)
router.post('/bulk-operations',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    checkFeatureAccess('advancedAnalytics'),
    bulkOperationValidation,
    validateRequest,
    orderController.createBulkOperation
);

/**
 * @swagger
 * /api/v1/orders/recurring/process:
 *   post:
 *     summary: Process recurring orders (Enterprise Feature)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recurring orders processed successfully
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
 *                     processedCount:
 *                       type: integer
 *                     createdOrders:
 *                       type: array
 *                       items:
 *                         type: string
 *       403:
 *         description: Feature not available in current plan
 */
// Recurring Orders (Enterprise Feature)
router.post('/recurring/process',
    auth([UserRole.OWNER]),
    checkFeatureAccess('advancedAnalytics'),
    orderController.processRecurringOrders
);

export default router;