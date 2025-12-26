import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './core/database/db';
import { errorHandler } from './core/middlewares/error-handler';
import { startSubscriptionCron } from './modules/payments/infrastructure/jobs/SubscriptionCron';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './core/config/swagger';
import v1Router from './api/v1';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1', v1Router);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error Handling
app.use(errorHandler);

const start = async () => {
    try {
        await connectDB();
        startSubscriptionCron();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
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
