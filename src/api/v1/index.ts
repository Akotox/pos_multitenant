import { Router } from 'express';

// Import route modules
import customerRoutes from '../../modules/customers/interfaces/http/routes/customer.routes';
import inventoryRoutes from '../../modules/inventory/interfaces/http/routes/inventory.routes';
import paymentsRoutes from '../../modules/payments/interfaces/http/routes/payments.routes';
import reportsRoutes from '../../modules/reports/interfaces/reports.routes';
import adminRoutes from '../../modules/admin/interfaces/routes/admin.routes';
import pricingRoutes from '../../modules/pricing/interfaces/routes/pricing.routes';

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
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/payments', paymentsRoutes);
router.use('/reports', reportsRoutes);
router.use('/admin', adminRoutes);
router.use('/pricing', pricingRoutes);

export default router;