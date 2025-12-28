import { Router } from 'express';
import { EmailAdminController } from '../controllers/EmailAdminController';
import { adminAuth } from '../../../../core/middlewares/auth';

const emailAdminController = new EmailAdminController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin Email
 *   description: Email management and testing for administrators
 */

// All email admin routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /admin/email/test:
 *   post:
 *     summary: Test email connectivity
 *     tags: [Admin Email]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testEmail
 *             properties:
 *               testEmail:
 *                 type: string
 *                 format: email
 *                 description: Email address to send test email to
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       500:
 *         description: Email service error
 */
router.post('/test', emailAdminController.testEmail);

/**
 * @swagger
 * /admin/email/broadcast:
 *   post:
 *     summary: Send broadcast email to all tenants
 *     tags: [Admin Email]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Email subject
 *               message:
 *                 type: string
 *                 description: Email message content
 *               isUrgent:
 *                 type: boolean
 *                 description: Mark as urgent notification
 *               targetRole:
 *                 type: string
 *                 enum: [ALL, OWNER, MANAGER]
 *                 description: Target user role for broadcast
 *     responses:
 *       200:
 *         description: Broadcast email sent successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/broadcast', emailAdminController.sendBroadcast);

/**
 * @swagger
 * /admin/email/reports/trigger:
 *   post:
 *     summary: Manually trigger email reports
 *     tags: [Admin Email]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 description: Type of report to trigger
 *               tenantId:
 *                 type: string
 *                 description: Specific tenant ID (optional, triggers for all if not provided)
 *     responses:
 *       200:
 *         description: Reports triggered successfully
 *       400:
 *         description: Invalid report type
 */
router.post('/reports/trigger', emailAdminController.triggerReports);

/**
 * @swagger
 * /admin/email/templates:
 *   get:
 *     summary: List all available email templates
 *     tags: [Admin Email]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: List of email templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 */
router.get('/templates', emailAdminController.listTemplates);

/**
 * @swagger
 * /admin/email/stats:
 *   get:
 *     summary: Get email delivery statistics
 *     tags: [Admin Email]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to include in statistics
 *     responses:
 *       200:
 *         description: Email statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSent:
 *                   type: integer
 *                 successRate:
 *                   type: number
 *                 byTemplate:
 *                   type: object
 *                 byDay:
 *                   type: array
 */
router.get('/stats', emailAdminController.getEmailStats);

export default router;