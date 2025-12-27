import mongoose from 'mongoose';
import { seedDefaultAdmins } from '../../../modules/admin/infrastructure/seeds/createSuperAdmin';
import { seedPricingPlans } from '../../../modules/pricing/infrastructure/seeds/seedPricingPlans';

export async function runSeeders() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Seed default admins
        await seedDefaultAdmins();
        
        // Seed pricing plans
        await seedPricingPlans();
        
        console.log('✅ Database seeding completed successfully');
    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        throw error;
    }
}

// Run seeders if this file is executed directly
if (require.main === module) {
    mongoose.connect(process.env.MONGODB_URI!)
        .then(() => {
            console.log('Connected to MongoDB');
            return runSeeders();
        })
        .then(() => {
            console.log('Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}