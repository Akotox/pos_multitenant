import { Router } from 'express';
import { CategoryController } from './category.controller';
import { CategoryUseCases } from '../application/category.usecases';
import { CategoryRepository } from '../infrastructure/category.repository.impl';
import { auth } from '../../../core/middlewares/auth';
import { UserRole } from '../../auth/infrastructure/user.model';

const categoryRepository = new CategoryRepository();
const categoryUseCases = new CategoryUseCases(categoryRepository);
const categoryController = new CategoryController(categoryUseCases);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

// All category routes require authentication
router.use(auth());

router.use(auth());

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.get('/', categoryController.getAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
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
 *         description: Category details
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Category deleted
 */
router.get('/:id', categoryController.getById);

// Only OWNER and MANAGER can create, update, delete categories
router.post('/', auth([UserRole.OWNER, UserRole.MANAGER]), categoryController.create);
router.put('/:id', auth([UserRole.OWNER, UserRole.MANAGER]), categoryController.update);
router.delete('/:id', auth([UserRole.OWNER, UserRole.MANAGER]), categoryController.delete);

export default router;
