import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { RecordStockMovementUseCase } from '../../../application/RecordStockMovementUseCase';
import { InventoryRepositoryImpl } from '../../../infrastructure/database/repositories/InventoryRepositoryImpl';
import { ProductRepository } from '../../../../products/infrastructure/product.repository.impl';
import { auth } from '../../../../../core/middlewares/auth';
import { UserRole } from '../../../../auth/infrastructure/user.model';
import { subscriptionGuard } from '../../../../payments/interfaces/http/middleware/SubscriptionGuardMiddleware';

const inventoryRepository = new InventoryRepositoryImpl();
const productRepository = new ProductRepository();
const recordMovementUseCase = new RecordStockMovementUseCase(inventoryRepository, productRepository);
const inventoryController = new InventoryController(recordMovementUseCase, inventoryRepository);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Stock management
 */

router.use(auth());
router.use(subscriptionGuard);

router.use(subscriptionGuard);

/**
 * @swagger
 * /inventory/history/{productId}:
 *   get:
 *     summary: View stock history for a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock history
 */
router.get('/history/:productId', auth([UserRole.OWNER, UserRole.MANAGER]), inventoryController.getHistory);

/**
 * @swagger
 * /inventory/adjust:
 *   post:
 *     summary: Manually adjust stock
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - type
 *               - quantity
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [IN, OUT, ADJUSTMENT]
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stock adjusted
 */
router.post('/adjust', auth([UserRole.OWNER, UserRole.MANAGER]), inventoryController.adjustStock);

export default router;
