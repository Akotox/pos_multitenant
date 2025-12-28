// import { IInventoryRepository } from '../domain/repositories/InventoryRepository';
import { emailNotificationService } from '../../../core/services/email/EmailNotificationService';

export class InventoryMonitoringService {
    constructor(private inventoryRepository?: any) {} // Make optional for now

    async checkLowStockAlerts(tenantId: string): Promise<void> {
        try {
            // Get all products with low stock for this tenant
            const lowStockProducts = await this.inventoryRepository.findLowStockProducts(tenantId);
            
            if (lowStockProducts.length === 0) {
                return;
            }

            // Get tenant owner/manager emails (you'll need to implement this)
            const managerEmails = await this.getManagerEmails(tenantId);
            
            if (managerEmails.length === 0) {
                console.warn(`No manager emails found for tenant ${tenantId}`);
                return;
            }

            // Send individual alerts for each low stock product
            for (const product of lowStockProducts) {
                await emailNotificationService.sendLowStockAlert({
                    email: managerEmails,
                    recipientName: 'Store Manager',
                    productName: product.name,
                    currentStock: product.currentStock,
                    minimumStock: product.minimumStock || 10
                });

                console.log(`Low stock alert sent for product: ${product.name} (${product.currentStock} remaining)`);
            }

        } catch (error) {
            console.error('Error checking low stock alerts:', error);
        }
    }

    async checkOutOfStockAlerts(tenantId: string): Promise<void> {
        try {
            // Get all out of stock products for this tenant
            const outOfStockProducts = await this.inventoryRepository.findOutOfStockProducts(tenantId);
            
            if (outOfStockProducts.length === 0) {
                return;
            }

            const managerEmails = await this.getManagerEmails(tenantId);
            
            if (managerEmails.length === 0) {
                return;
            }

            // Send urgent alerts for out of stock products
            for (const product of outOfStockProducts) {
                await emailNotificationService.sendLowStockAlert({
                    email: managerEmails,
                    recipientName: 'Store Manager',
                    productName: product.name,
                    currentStock: 0,
                    minimumStock: product.minimumStock || 10
                });

                console.log(`Out of stock alert sent for product: ${product.name}`);
            }

        } catch (error) {
            console.error('Error checking out of stock alerts:', error);
        }
    }

    private async getManagerEmails(tenantId: string): Promise<string[]> {
        // This is a placeholder - you'll need to implement this based on your user management
        // It should return emails of users with OWNER or MANAGER roles for the tenant
        try {
            // Example implementation - you'll need to adapt this to your user repository
            // const users = await this.userRepository.findByTenantIdAndRoles(tenantId, ['OWNER', 'MANAGER']);
            // return users.map(user => user.email);
            
            // For now, return a default email - replace with actual implementation
            return ['manager@company.com']; // Placeholder
        } catch (error) {
            console.error('Error getting manager emails:', error);
            return [];
        }
    }

    // Method to be called when stock levels change
    async onStockChange(tenantId: string, productId: string, newStock: number, minimumStock: number = 10): Promise<void> {
        if (newStock <= 0) {
            // Immediate out of stock alert
            await this.checkOutOfStockAlerts(tenantId);
        } else if (newStock <= minimumStock) {
            // Low stock alert
            await this.checkLowStockAlerts(tenantId);
        }
    }
}

// Interface for the repository methods you'll need to implement
export interface LowStockProduct {
    id: string;
    name: string;
    currentStock: number;
    minimumStock?: number;
}