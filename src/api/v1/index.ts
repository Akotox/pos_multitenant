import { Router } from 'express';
import authRoutes from '../../modules/auth/interfaces/auth.routes';
import tenantRoutes from '../../modules/auth/interfaces/tenant.routes';
import categoryRoutes from '../../modules/categories/interfaces/category.routes';
import productRoutes from '../../modules/products/interfaces/product.routes';
import salesRoutes from '../../modules/sales/interfaces/sales.routes';
import reportsRoutes from '../../modules/reports/interfaces/reports.routes';
import paymentsRoutes from '../../modules/payments/interfaces/http/routes/payments.routes';
import inventoryRoutes from '../../modules/inventory/interfaces/http/routes/inventory.routes';
import customerRoutes from '../../modules/customers/interfaces/http/routes/customer.routes';
import { subscriptionGuard } from '../../modules/payments/interfaces/http/middleware/SubscriptionGuardMiddleware';

const v1Router = Router();

// Public / Unprotected routes (Auth middleware handled inside routes)
v1Router.use('/auth', authRoutes);
v1Router.use('/payments', paymentsRoutes);

// Protected routes
v1Router.use('/tenants', tenantRoutes); // Includes its own auth middleware

// Protected routes with Subscription Guard
v1Router.use('/categories', subscriptionGuard, categoryRoutes);
v1Router.use('/products', subscriptionGuard, productRoutes);
v1Router.use('/sales', subscriptionGuard, salesRoutes);
v1Router.use('/reports', subscriptionGuard, reportsRoutes);
v1Router.use('/inventory', subscriptionGuard, inventoryRoutes);
v1Router.use('/customers', subscriptionGuard, customerRoutes);

export default v1Router;
