import { PricingPlanModel } from '../models/pricing.models';
import { defaultPricingPlans } from './defaultPlans';

export async function seedPricingPlans() {
    try {
        console.log('Seeding pricing plans...');
        
        for (const planData of defaultPricingPlans) {
            const existingPlan = await PricingPlanModel.findOne({ name: planData.name });
            
            if (!existingPlan) {
                const plan = await PricingPlanModel.create(planData);
                console.log(`Created pricing plan: ${plan.name} - $${(plan.price / 100).toFixed(2)}/${plan.billingInterval.toLowerCase()}`);
            } else {
                console.log(`Pricing plan already exists: ${planData.name}`);
            }
        }
        
        console.log('Pricing plans seeded successfully');
    } catch (error) {
        console.error('Error seeding pricing plans:', error);
        throw error;
    }
}

export async function updatePricingPlansWithStripe() {
    try {
        console.log('Updating pricing plans with Stripe integration...');
        
        // This would be called after Stripe is configured
        // to create products and prices in Stripe and update the local plans
        const plans = await PricingPlanModel.find({ stripePriceId: { $exists: false } });
        
        console.log(`Found ${plans.length} plans without Stripe integration`);
        console.log('Run the admin command to sync with Stripe after configuring Stripe keys');
        
    } catch (error) {
        console.error('Error updating pricing plans with Stripe:', error);
        throw error;
    }
}