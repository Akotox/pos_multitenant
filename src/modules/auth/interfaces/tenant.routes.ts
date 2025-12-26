import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { GetTenantUseCase } from '../application/get-tenant.usecase';
import { AuthRepository } from '../infrastructure/auth.repository.impl';
import { auth } from '../../../core/middlewares/auth';
import { UserRole } from '../infrastructure/user.model';

const authRepository = new AuthRepository();
const getTenantUseCase = new GetTenantUseCase(authRepository);
const tenantController = new TenantController(getTenantUseCase);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management
 */

router.use(auth());

/**
 * @swagger
 * /tenants/me:
 *   get:
 *     summary: Get current tenant details
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant details
 */
router.get('/me', (req, res, next) => {
    // Force usage of tenantId from token
    if (req.tenantId && req.params) {
        Object.assign(req.params, { id: req.tenantId });
    }
    tenantController.getById(req, res, next);
});

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     summary: Get tenant by ID (Owner only)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant details
 */
router.get('/:id', auth([UserRole.OWNER]), tenantController.getById);

export default router;
