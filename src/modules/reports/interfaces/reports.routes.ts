import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { ReportsUseCases } from '../application/reports.usecases';
import { auth } from '../../../core/middlewares/auth';
import { UserRole } from '../../auth/infrastructure/user.model';

const reportsUseCases = new ReportsUseCases();
const reportsController = new ReportsController(reportsUseCases);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Analytics and reporting
 */

// All reports routes require authentication and MANAGER/OWNER role
router.use(auth([UserRole.OWNER, UserRole.MANAGER]));

// All reports routes require authentication and MANAGER/OWNER role
router.use(auth([UserRole.OWNER, UserRole.MANAGER]));

/**
 * @swagger
 * /reports/daily-sales:
 *   get:
 *     summary: Get daily sales summary
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily stats
 */
router.get('/daily-sales', reportsController.getDailySales);

/**
 * @swagger
 * /reports/product-performance:
 *   get:
 *     summary: Get product performance stats
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product stats
 */
router.get('/product-performance', reportsController.getSalesByProduct);

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/dashboard', reportsController.getDashboardStats);

/**
 * @swagger
 * /reports/advanced:
 *   get:
 *     summary: Get advanced analytics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Advanced stats
 */
router.get('/advanced', reportsController.getAdvancedStats);

export default router;
