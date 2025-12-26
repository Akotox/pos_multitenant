import { Router } from 'express';
import { SalesController } from './sales.controller';
import { ProcessSaleUseCase } from '../application/process-sale.usecase';
import { SalesRepository } from '../infrastructure/sales.repository.impl';
import { ProductRepository } from '../../products/infrastructure/product.repository.impl';
import { InventoryRepositoryImpl } from '../../inventory/infrastructure/database/repositories/InventoryRepositoryImpl';
import { CustomerRepositoryImpl } from '../../customers/infrastructure/database/repositories/CustomerRepositoryImpl';
import { auth } from '../../../core/middlewares/auth';

const salesRepository = new SalesRepository();
const productRepository = new ProductRepository();
const inventoryRepository = new InventoryRepositoryImpl();
const customerRepository = new CustomerRepositoryImpl();
const processSaleUseCase = new ProcessSaleUseCase(salesRepository, productRepository, inventoryRepository, customerRepository);
const salesController = new SalesController(processSaleUseCase, salesRepository);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales processing
 */

// All sales routes require authentication
router.use(auth());

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Process a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CARD, MOBILE]
 *               customerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale processed
 *   get:
 *     summary: List all sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales
 */
router.post('/', salesController.process);
router.get('/', salesController.getAll);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
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
 *         description: Sale details
 */
router.get('/:id', salesController.getById);

export default router;
