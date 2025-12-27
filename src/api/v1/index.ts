import { Router } from 'express';

// Import route modules
import authRoutes from '../../modules/auth/interfaces/auth.routes';
import tenantRoutes from '../../modules/auth/interfaces/tenant.routes';
import customerRoutes from '../../modules/customers/interfaces/http/routes/customer.routes';
import inventoryRoutes from '../../modules/inventory/interfaces/http/routes/inventory.routes';
import paymentsRoutes from '../../modules/payments/interfaces/http/routes/payments.routes';
import reportsRoutes from '../../modules/reports/interfaces/reports.routes';
import adminRoutes from '../../modules/admin/interfaces/routes/admin.routes';
import pricingRoutes from '../../modules/pricing/interfaces/routes/pricing.routes';
import orderRoutes from '../../modules/orders/interfaces/routes/order.routes';
import salesRoutes from '../../modules/sales/interfaces/sales.routes';
import productRoutes from '../../modules/products/interfaces/product.routes';
import categoryRoutes from '../../modules/categories/interfaces/category.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/payments', paymentsRoutes);
router.use('/reports', reportsRoutes);
router.use('/admin', adminRoutes);
router.use('/pricing', pricingRoutes);
router.use('/orders', orderRoutes);
router.use('/sales', salesRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export default router;