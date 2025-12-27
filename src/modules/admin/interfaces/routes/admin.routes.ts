import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { AdminUseCases } from '../../application/usecases/AdminUseCases';
import { AdminRepositoryImpl } from '../../infrastructure/repositories/AdminRepositoryImpl';
import { adminAuthMiddleware, requirePermission, requireAnyPermission } from '../middlewares/adminAuth.middleware';
import { AdminPermission } from '../../domain/entities/Admin';
import { validateRequest } from '../../../../core/middlewares/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Dependencies
const adminRepository = new AdminRepositoryImpl();
const adminUseCases = new AdminUseCases(adminRepository);
const adminController = new AdminController(adminUseCases);

// Validation schemas
const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const createAdminValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['SUPER_ADMIN', 'ADMIN', 'BILLING_ADMIN', 'SUPPORT']).withMessage('Valid role is required')
];

const updateAdminValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['SUPER_ADMIN', 'ADMIN', 'BILLING_ADMIN', 'SUPPORT']).withMessage('Valid role is required')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

const paginationValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Public routes
router.post('/login', loginValidation, validateRequest, adminController.login);

// Protected routes - require authentication
router.use(adminAuthMiddleware);

// Admin management routes
router.post('/', 
    requirePermission(AdminPermission.CREATE_USER),
    createAdminValidation, 
    validateRequest, 
    adminController.createAdmin
);

router.get('/', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    paginationValidation, 
    validateRequest, 
    adminController.getAllAdmins
);

router.get('/:id', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    validateRequest, 
    adminController.getAdminById
);

router.put('/:id', 
    requirePermission(AdminPermission.UPDATE_USER),
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    updateAdminValidation, 
    validateRequest, 
    adminController.updateAdmin
);

router.delete('/:id', 
    requirePermission(AdminPermission.DELETE_USER),
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    validateRequest, 
    adminController.deleteAdmin
);

router.put('/:id/password', 
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    changePasswordValidation, 
    validateRequest, 
    adminController.changePassword
);

// Tenant management routes
router.get('/tenants/list', 
    requirePermission(AdminPermission.VIEW_ALL_TENANTS),
    paginationValidation, 
    validateRequest, 
    adminController.getAllTenants
);

router.get('/tenants/:id', 
    requirePermission(AdminPermission.VIEW_ALL_TENANTS),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.getTenantById
);

router.put('/tenants/:id', 
    requirePermission(AdminPermission.UPDATE_TENANT),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.updateTenant
);

router.put('/tenants/:id/suspend', 
    requirePermission(AdminPermission.SUSPEND_TENANT),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.suspendTenant
);

router.put('/tenants/:id/activate', 
    requirePermission(AdminPermission.SUSPEND_TENANT),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.activateTenant
);

// User management routes
router.get('/users/list', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    paginationValidation, 
    validateRequest, 
    adminController.getAllUsers
);

router.get('/users/:id', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    param('id').isMongoId().withMessage('Valid user ID is required'),
    validateRequest, 
    adminController.getUserById
);

router.put('/users/:id', 
    requirePermission(AdminPermission.UPDATE_USER),
    param('id').isMongoId().withMessage('Valid user ID is required'),
    validateRequest, 
    adminController.updateUser
);

router.put('/users/:id/reset-password', 
    requirePermission(AdminPermission.RESET_USER_PASSWORD),
    param('id').isMongoId().withMessage('Valid user ID is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    validateRequest, 
    adminController.resetUserPassword
);

// Analytics routes
router.get('/dashboard/stats', 
    requirePermission(AdminPermission.VIEW_GLOBAL_ANALYTICS),
    adminController.getDashboard
);

router.get('/analytics/tenant/:tenantId', 
    requirePermission(AdminPermission.VIEW_GLOBAL_ANALYTICS),
    param('tenantId').isMongoId().withMessage('Valid tenant ID is required'),
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    validateRequest, 
    adminController.getTenantAnalytics
);

export default router;