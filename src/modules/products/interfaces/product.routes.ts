import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductUseCases } from '../application/product.usecases';
import { ProductRepository } from '../infrastructure/product.repository.impl';
import { auth } from '../../../core/middlewares/auth';
import { UserRole } from '../../auth/infrastructure/user.model';
import { InventoryRepositoryImpl } from '../../inventory/infrastructure/database/repositories/InventoryRepositoryImpl';

const productRepository = new ProductRepository();
const inventoryRepository = new InventoryRepositoryImpl();
const productUseCases = new ProductUseCases(productRepository, inventoryRepository);
const productController = new ProductController(productUseCases);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

// All product routes require authentication
router.use(auth());

router.use(auth());

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               buyingPrice:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created
 */
router.get('/', productController.getAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
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
 *         description: Product details
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               buyingPrice:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted
 */
router.get('/:id', productController.getById);

// Only OWNER and MANAGER can create, update, delete products
router.post('/', auth([UserRole.OWNER, UserRole.MANAGER]), productController.create);
router.put('/:id', auth([UserRole.OWNER, UserRole.MANAGER]), productController.update);
router.delete('/:id', auth([UserRole.OWNER, UserRole.MANAGER]), productController.delete);

export default router;
