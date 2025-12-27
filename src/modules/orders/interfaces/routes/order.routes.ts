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

// Basic CRUD Operations
router.post('/', 
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    checkSubscriptionLimits('sales'),
    createOrderValidation,
    validateRequest,
    orderController.createOrder
);

router.get('/',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    paginationValidation,
    validateRequest,
    orderController.getOrders
);

router.get('/search',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    query('q').notEmpty().withMessage('Search term is required'),
    paginationValidation,
    validateRequest,
    orderController.searchOrders
);

router.get('/metrics',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    checkFeatureAccess('advancedAnalytics'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    validateRequest,
    orderController.getOrderMetrics
);

router.get('/overdue',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    orderController.getOverdueOrders
);

router.get('/due-today',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    orderController.getOrdersDueToday
);

router.get('/pending-approval',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    orderController.getPendingApprovalOrders
);

router.get('/number/:orderNumber',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('orderNumber').notEmpty().withMessage('Order number is required'),
    validateRequest,
    orderController.getOrderByNumber
);

router.get('/customer/:customerId',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('customerId').isMongoId().withMessage('Valid customer ID is required'),
    paginationValidation,
    validateRequest,
    orderController.getOrdersByCustomer
);

router.get('/:id',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    validateRequest,
    orderController.getOrderById
);

router.put('/:id',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    updateOrderValidation,
    validateRequest,
    orderController.updateOrder
);

router.put('/:id/status',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    updateStatusValidation,
    validateRequest,
    orderController.updateOrderStatus
);

router.delete('/:id',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    validateRequest,
    orderController.deleteOrder
);

// Payment Management
router.post('/:id/payments',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    recordPaymentValidation,
    validateRequest,
    orderController.recordPayment
);

// Approval Workflow
router.post('/:id/approve',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    approvalValidation,
    validateRequest,
    orderController.approveOrder
);

router.post('/:id/reject',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    param('id').isMongoId().withMessage('Valid order ID is required'),
    rejectValidation,
    validateRequest,
    orderController.rejectOrder
);

// Templates
router.post('/templates',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    createTemplateValidation,
    validateRequest,
    orderController.createTemplate
);

router.get('/templates/list',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    orderController.getTemplates
);

router.post('/templates/:templateId/create-order',
    auth([UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER]),
    param('templateId').isMongoId().withMessage('Valid template ID is required'),
    body('customerId').isMongoId().withMessage('Valid customer ID is required'),
    validateRequest,
    orderController.createOrderFromTemplate
);

// Bulk Operations (Enterprise Feature)
router.post('/bulk-operations',
    auth([UserRole.OWNER, UserRole.MANAGER]),
    checkFeatureAccess('advancedAnalytics'),
    bulkOperationValidation,
    validateRequest,
    orderController.createBulkOperation
);

// Recurring Orders (Enterprise Feature)
router.post('/recurring/process',
    auth([UserRole.OWNER]),
    checkFeatureAccess('advancedAnalytics'),
    orderController.processRecurringOrders
);

export default router;