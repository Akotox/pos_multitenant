import * as cron from 'node-cron';
import { emailReportService, DailySalesReportData } from '../../modules/reports/application/EmailReportService';
import { InventoryMonitoringService } from '../../modules/inventory/application/InventoryMonitoringService';
import { emailNotificationService } from '../services/email/EmailNotificationService';

export class EmailCronJobs {
    private inventoryMonitoringService?: InventoryMonitoringService;

    constructor() {
        // You'll need to inject the inventory repository here
        // this.inventoryMonitoringService = new InventoryMonitoringService(inventoryRepository);
    }

    startAllJobs(): void {
        this.startDailySalesReportJob();
        this.startLowStockCheckJob();
        this.startSubscriptionExpiryCheckJob();
        this.startWeeklySalesReportJob();
        this.startMonthlyReportJob();
        
        console.log('📧 Email cron jobs started successfully');
    }

    // Daily sales report - sent every day at 8 AM
    private startDailySalesReportJob(): void {
        cron.schedule('0 8 * * *', async () => {
            console.log('🔄 Running daily sales report job...');
            
            try {
                // Get all active tenants (you'll need to implement this)
                const activeTenants = await this.getActiveTenants();
                
                for (const tenant of activeTenants) {
                    const reportData = await this.generateDailySalesData(tenant.id);
                    if (reportData) {
                        await emailReportService.sendDailySalesReport(tenant.id, reportData);
                    }
                }
                
                console.log('✅ Daily sales reports sent successfully');
            } catch (error) {
                console.error('❌ Error sending daily sales reports:', error);
            }
        }, {
            timezone: 'America/New_York' // Adjust timezone as needed
        });
    }

    // Low stock check - runs every 4 hours during business hours
    private startLowStockCheckJob(): void {
        cron.schedule('0 8,12,16,20 * * *', async () => {
            console.log('🔄 Running low stock check...');
            
            try {
                const activeTenants = await this.getActiveTenants();
                
                for (const tenant of activeTenants) {
                    if (this.inventoryMonitoringService) {
                        await this.inventoryMonitoringService.checkLowStockAlerts(tenant.id);
                        await this.inventoryMonitoringService.checkOutOfStockAlerts(tenant.id);
                    }
                }
                
                console.log('✅ Low stock checks completed');
            } catch (error) {
                console.error('❌ Error checking low stock:', error);
            }
        });
    }

    // Subscription expiry check - runs daily at 9 AM
    private startSubscriptionExpiryCheckJob(): void {
        cron.schedule('0 9 * * *', async () => {
            console.log('🔄 Checking subscription expiries...');
            
            try {
                const expiringSubscriptions = await this.getExpiringSubscriptions();
                
                for (const subscription of expiringSubscriptions) {
                    await emailNotificationService.sendSubscriptionExpiringSoon({
                        email: subscription.ownerEmail,
                        recipientName: subscription.ownerName,
                        planName: subscription.planName,
                        expirationDate: subscription.expirationDate,
                        daysRemaining: subscription.daysRemaining
                    });
                }
                
                console.log('✅ Subscription expiry notifications sent');
            } catch (error) {
                console.error('❌ Error checking subscription expiries:', error);
            }
        });
    }

    // Weekly sales report - sent every Monday at 9 AM
    private startWeeklySalesReportJob(): void {
        cron.schedule('0 9 * * 1', async () => {
            console.log('🔄 Running weekly sales report job...');
            
            try {
                const activeTenants = await this.getActiveTenants();
                
                for (const tenant of activeTenants) {
                    const reportData = await this.generateWeeklySalesData(tenant.id);
                    if (reportData) {
                        await emailReportService.sendWeeklySalesReport(tenant.id, reportData);
                    }
                }
                
                console.log('✅ Weekly sales reports sent successfully');
            } catch (error) {
                console.error('❌ Error sending weekly sales reports:', error);
            }
        });
    }

    // Monthly report - sent on the 1st of each month at 10 AM
    private startMonthlyReportJob(): void {
        cron.schedule('0 10 1 * *', async () => {
            console.log('🔄 Running monthly sales report job...');
            
            try {
                const activeTenants = await this.getActiveTenants();
                
                for (const tenant of activeTenants) {
                    const reportData = await this.generateMonthlySalesData(tenant.id);
                    if (reportData) {
                        await emailReportService.sendMonthlySalesReport(tenant.id, reportData);
                    }
                }
                
                console.log('✅ Monthly sales reports sent successfully');
            } catch (error) {
                console.error('❌ Error sending monthly sales reports:', error);
            }
        });
    }

    // Helper methods - these need to be implemented based on your data layer
    private async getActiveTenants(): Promise<Array<{ id: string; name: string }>> {
        // Placeholder - implement based on your tenant repository
        return [
            { id: 'tenant1', name: 'Sample Tenant' }
        ];
    }

    private async generateDailySalesData(tenantId: string): Promise<DailySalesReportData | null> {
        // Placeholder - implement based on your sales repository
        const today = new Date().toLocaleDateString();
        
        return {
            date: today,
            totalSales: '$1,250.00',
            transactionCount: 45,
            averageTransaction: '$27.78',
            topProduct: 'Premium Coffee',
            cashSales: '$450.00',
            cardSales: '$800.00',
            refunds: '$25.00',
            netSales: '$1,225.00'
        };
    }

    private async generateWeeklySalesData(tenantId: string): Promise<any> {
        // Placeholder - implement based on your sales repository
        return {
            weekStartDate: '2024-01-01',
            weekEndDate: '2024-01-07',
            totalSales: '$8,750.00',
            totalTransactions: 315,
            averageDailySales: '$1,250.00',
            bestDay: 'Friday',
            bestDaySales: '$1,850.00',
            growthPercentage: '+12.5',
            topProducts: [
                { name: 'Premium Coffee', sales: '$2,100.00' },
                { name: 'Pastries', sales: '$1,650.00' }
            ]
        };
    }

    private async generateMonthlySalesData(tenantId: string): Promise<any> {
        // Placeholder - implement based on your sales repository
        return {
            month: 'January',
            year: 2024,
            totalSales: '$35,000.00',
            totalTransactions: 1260,
            averageDailySales: '$1,129.03',
            growthPercentage: '+18.2',
            uniqueCustomers: 450,
            bestDay: 'January 15th',
            bestDaySales: '$2,100.00',
            topProduct: 'Premium Coffee',
            averageTransaction: '$27.78'
        };
    }

    private async getExpiringSubscriptions(): Promise<Array<{
        ownerEmail: string;
        ownerName: string;
        planName: string;
        expirationDate: string;
        daysRemaining: number;
    }>> {
        // Placeholder - implement based on your subscription repository
        return [
            {
                ownerEmail: 'owner@company.com',
                ownerName: 'John Doe',
                planName: 'Professional',
                expirationDate: '2024-02-15',
                daysRemaining: 7
            }
        ];
    }

    // Method to send immediate notifications
    async sendImmediateAlert(
        tenantId: string,
        type: 'low_stock' | 'out_of_stock' | 'payment_failed' | 'system_alert',
        data: any
    ): Promise<void> {
        try {
            switch (type) {
                case 'low_stock':
                case 'out_of_stock':
                    if (this.inventoryMonitoringService) {
                        await this.inventoryMonitoringService.onStockChange(
                            tenantId,
                            data.productId,
                            data.newStock,
                            data.minimumStock
                        );
                    }
                    break;
                
                case 'payment_failed':
                    await emailNotificationService.sendPaymentFailed(data);
                    break;
                
                case 'system_alert':
                    await emailNotificationService.sendSystemAlert(
                        data.emails,
                        data.subject,
                        data.message,
                        data.isUrgent
                    );
                    break;
            }
        } catch (error) {
            console.error(`Error sending immediate alert (${type}):`, error);
        }
    }
}

export const emailCronJobs = new EmailCronJobs();