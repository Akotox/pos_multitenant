import cron from 'node-cron';
import { CheckSubscriptionExpiryUseCase } from '../../application/use-cases/CheckSubscriptionExpiryUseCase';
import { SubscriptionRepositoryImpl } from '../database/repositories/SubscriptionRepositoryImpl';

const subscriptionRepository = new SubscriptionRepositoryImpl();
const checkExpiryUseCase = new CheckSubscriptionExpiryUseCase(subscriptionRepository);

// Run every hour
export const startSubscriptionCron = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('Running subscription expiry check...');
        try {
            await checkExpiryUseCase.execute();
        } catch (error) {
            console.error('Error in subscription expiry check cron:', error);
        }
    });
    console.log('Subscription cron job scheduled');
};
