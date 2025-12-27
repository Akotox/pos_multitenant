/**
 * @swagger
 * components:
 *   schemas:
 *     AdminLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         password:
 *           type: string
 *           minimum: 6
 *           example: "password123"
 *     
 *     CreateAdminRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         password:
 *           type: string
 *           minimum: 8
 *           example: "securepassword123"
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, ADMIN, BILLING_ADMIN, SUPPORT]
 *           example: "ADMIN"
 *     
 *     UpdateAdminRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, ADMIN, BILLING_ADMIN, SUPPORT]
 *           example: "ADMIN"
 *     
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "oldpassword123"
 *         newPassword:
 *           type: string
 *           minimum: 8
 *           example: "newpassword123"
 *     
 *     AdminLoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             admin:
 *               $ref: '#/components/schemas/Admin'
 *             token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

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

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Public routes
router.post('/login', loginValidation, validateRequest, adminController.login);

// Protected routes - require authentication
router.use(adminAuthMiddleware);

/**
 * @swagger
 * /api/v1/admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminRequest'
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       403:
 *         description: Insufficient permissions
 */
// Admin management routes
router.post('/', 
    requirePermission(AdminPermission.CREATE_USER),
    createAdminValidation, 
    validateRequest, 
    adminController.createAdmin
);

/**
 * @swagger
 * /api/v1/admin:
 *   get:
 *     summary: Get all admins with pagination
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
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
 *     responses:
 *       200:
 *         description: Admins retrieved successfully
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
 *                     $ref: '#/components/schemas/Admin'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    paginationValidation, 
    validateRequest, 
    adminController.getAllAdmins
);

/**
 * @swagger
 * /api/v1/admin/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 */
router.get('/:id', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    validateRequest, 
    adminController.getAdminById
);

/**
 * @swagger
 * /api/v1/admin/{id}:
 *   put:
 *     summary: Update admin
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminRequest'
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 */
router.put('/:id', 
    requirePermission(AdminPermission.UPDATE_USER),
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    updateAdminValidation, 
    validateRequest, 
    adminController.updateAdmin
);

/**
 * @swagger
 * /api/v1/admin/{id}:
 *   delete:
 *     summary: Delete admin
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
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
 *                   example: Admin deleted successfully
 *       404:
 *         description: Admin not found
 */
router.delete('/:id', 
    requirePermission(AdminPermission.DELETE_USER),
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    validateRequest, 
    adminController.deleteAdmin
);

/**
 * @swagger
 * /api/v1/admin/{id}/password:
 *   put:
 *     summary: Change admin password
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid current password
 */
router.put('/:id/password', 
    param('id').isMongoId().withMessage('Valid admin ID is required'),
    changePasswordValidation, 
    validateRequest, 
    adminController.changePassword
);

/**
 * @swagger
 * /api/v1/admin/tenants/list:
 *   get:
 *     summary: Get all tenants
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
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
 *         description: Tenants retrieved successfully
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
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
// Tenant management routes
router.get('/tenants/list', 
    requirePermission(AdminPermission.VIEW_ALL_TENANTS),
    paginationValidation, 
    validateRequest, 
    adminController.getAllTenants
);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant found
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
 *       404:
 *         description: Tenant not found
 */
router.get('/tenants/:id', 
    requirePermission(AdminPermission.VIEW_ALL_TENANTS),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.getTenantById
);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}:
 *   put:
 *     summary: Update tenant
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 */
router.put('/tenants/:id', 
    requirePermission(AdminPermission.UPDATE_TENANT),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.updateTenant
);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}/suspend:
 *   put:
 *     summary: Suspend tenant
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant suspended successfully
 */
router.put('/tenants/:id/suspend', 
    requirePermission(AdminPermission.SUSPEND_TENANT),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.suspendTenant
);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}/activate:
 *   put:
 *     summary: Activate tenant
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant activated successfully
 */
router.put('/tenants/:id/activate', 
    requirePermission(AdminPermission.SUSPEND_TENANT),
    param('id').isMongoId().withMessage('Valid tenant ID is required'),
    validateRequest, 
    adminController.activateTenant
);

/**
 * @swagger
 * /api/v1/admin/users/list:
 *   get:
 *     summary: Get all users across all tenants
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
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
 *         description: Users retrieved successfully
 */
// User management routes
router.get('/users/list', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    paginationValidation, 
    validateRequest, 
    adminController.getAllUsers
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/users/:id', 
    requirePermission(AdminPermission.VIEW_ALL_USERS),
    param('id').isMongoId().withMessage('Valid user ID is required'),
    validateRequest, 
    adminController.getUserById
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/users/:id', 
    requirePermission(AdminPermission.UPDATE_USER),
    param('id').isMongoId().withMessage('Valid user ID is required'),
    validateRequest, 
    adminController.updateUser
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/reset-password:
 *   put:
 *     summary: Reset user password
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minimum: 8
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.put('/users/:id/reset-password', 
    requirePermission(AdminPermission.RESET_USER_PASSWORD),
    param('id').isMongoId().withMessage('Valid user ID is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    validateRequest, 
    adminController.resetUserPassword
);

/**
 * @swagger
 * /api/v1/admin/dashboard/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
 *                     totalTenants:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     activeTenants:
 *                       type: integer
 *                     suspendedTenants:
 *                       type: integer
 */
// Analytics routes
router.get('/dashboard/stats', 
    requirePermission(AdminPermission.VIEW_GLOBAL_ANALYTICS),
    adminController.getDashboard
);

/**
 * @swagger
 * /api/v1/admin/analytics/tenant/{tenantId}:
 *   get:
 *     summary: Get analytics for a specific tenant
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days for analytics
 *     responses:
 *       200:
 *         description: Tenant analytics
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
 *                     sales:
 *                       type: object
 *                     users:
 *                       type: object
 *                     products:
 *                       type: object
 */
router.get('/analytics/tenant/:tenantId', 
    requirePermission(AdminPermission.VIEW_GLOBAL_ANALYTICS),
    param('tenantId').isMongoId().withMessage('Valid tenant ID is required'),
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    validateRequest, 
    adminController.getTenantAnalytics
);

export default router;