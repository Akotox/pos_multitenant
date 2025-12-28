import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './core/database/db';
import { errorHandler } from './core/middlewares/error-handler';
import { startSubscriptionCron } from './modules/payments/infrastructure/jobs/SubscriptionCron';
import { setupSwagger } from './config/swagger';
import { emailService } from './core/services/email/EmailService';
import { emailCronJobs } from './core/jobs/EmailCronJobs';
import v1Router from './api/v1';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Documentation
setupSwagger(app);

// Routes
app.use('/api/v1', v1Router);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Email health check endpoint
app.get('/health/email', async (req, res) => {
    try {
        const isConnected = await emailService.verifyConnection();
        res.json({ 
            status: isConnected ? 'ok' : 'error',
            service: 'email',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            service: 'email',
            error: 'SMTP connection failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Error Handling
app.use(errorHandler);

const start = async () => {
    try {
        await connectDB();
        
        // Verify email connection
        console.log('🔄 Verifying email connection...');
        const emailConnected = await emailService.verifyConnection();
        if (emailConnected) {
            console.log('✅ Email service connected successfully');
            
            // Start email cron jobs
            emailCronJobs.startAllJobs();
        } else {
            console.warn('⚠️  Email service connection failed - emails will not be sent');
        }
        
        startSubscriptionCron();
        
        app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
            console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
            console.log(`🏥 Health Check: http://localhost:${port}/health`);
            console.log(`📧 Email Health: http://localhost:${port}/health/email`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

export default app;
