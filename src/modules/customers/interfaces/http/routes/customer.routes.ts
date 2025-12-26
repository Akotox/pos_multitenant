import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { CreateCustomerUseCase } from '../../../application/CreateCustomerUseCase';
import { UpdateCustomerUseCase } from '../../../application/UpdateCustomerUseCase';
import { GetCustomerUseCase } from '../../../application/GetCustomerUseCase';
import { ListCustomersUseCase } from '../../../application/ListCustomersUseCase';
import { DeleteCustomerUseCase } from '../../../application/DeleteCustomerUseCase';
import { CustomerRepositoryImpl } from '../../../infrastructure/database/repositories/CustomerRepositoryImpl';
import { auth } from '../../../../../core/middlewares/auth';
import { UserRole } from '../../../../auth/infrastructure/user.model';
import { subscriptionGuard } from '../../../../payments/interfaces/http/middleware/SubscriptionGuardMiddleware';

const customerRepository = new CustomerRepositoryImpl();
const createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
const getCustomerUseCase = new GetCustomerUseCase(customerRepository);
const listCustomersUseCase = new ListCustomersUseCase(customerRepository);
const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);

const customerController = new CustomerController(
    createCustomerUseCase,
    updateCustomerUseCase,
    getCustomerUseCase,
    listCustomersUseCase,
    deleteCustomerUseCase
);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */

router.use(auth());
router.use(subscriptionGuard);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created
 *   get:
 *     summary: List all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *     responses:
 *       200:
 *         description: List of customers
 */
router.post('/', customerController.create);
router.get('/', customerController.getAll);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
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
 *         description: Customer details
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
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
 *         description: Customer deleted
 */
router.get('/:id', customerController.getById);
router.put('/:id', customerController.update);
router.delete('/:id', auth([UserRole.OWNER, UserRole.MANAGER]), customerController.delete);

export default router;
