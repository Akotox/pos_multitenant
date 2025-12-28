import { emailNotificationService } from '../../../core/services/email/EmailNotificationService';

export class EmailReportService {
    
    async sendDailySalesReport(tenantId: string, reportData: DailySalesReportData): Promise<boolean> {
        try {
            // Get manager emails for this tenant
            const managerEmails = await this.getManagerEmails(tenantId);
            
            if (managerEmails.length === 0) {
                console.warn(`No manager emails found for tenant ${tenantId}`);
                return false;
            }

            const success = await emailNotificationService.sendDailySalesReport({
                email: managerEmails,
                recipientName: 'Store Manager',
                reportDate: reportData.date,
                totalSales: reportData.totalSales,
                transactionCount: reportData.transactionCount.toString(),
                averageTransaction: reportData.averageTransaction,
                topProduct: reportData.topProduct,
                cashSales: reportData.cashSales,
                cardSales: reportData.cardSales,
                refunds: reportData.refunds,
                netSales: reportData.netSales
            });

            if (success) {
                console.log(`Daily sales report sent for tenant ${tenantId} on ${reportData.date}`);
            }

            return success;
        } catch (error) {
            console.error('Error sending daily sales report:', error);
            return false;
        }
    }

    async sendWeeklySalesReport(tenantId: string, reportData: WeeklySalesReportData): Promise<boolean> {
        try {
            const managerEmails = await this.getManagerEmails(tenantId);
            
            if (managerEmails.length === 0) {
                return false;
            }

            // Create a custom weekly report email
            const emailContent = this.generateWeeklyReportHTML(reportData);
            
            const success = await emailNotificationService.sendSystemAlert(
                managerEmails,
                `Weekly Sales Report - ${reportData.weekStartDate} to ${reportData.weekEndDate}`,
                emailContent,
                false
            );

            return success;
        } catch (error) {
            console.error('Error sending weekly sales report:', error);
            return false;
        }
    }

    async sendMonthlySalesReport(tenantId: string, reportData: MonthlySalesReportData): Promise<boolean> {
        try {
            const managerEmails = await this.getManagerEmails(tenantId);
            
            if (managerEmails.length === 0) {
                return false;
            }

            const emailContent = this.generateMonthlyReportHTML(reportData);
            
            const success = await emailNotificationService.sendSystemAlert(
                managerEmails,
                `Monthly Sales Report - ${reportData.month} ${reportData.year}`,
                emailContent,
                false
            );

            return success;
        } catch (error) {
            console.error('Error sending monthly sales report:', error);
            return false;
        }
    }

    private async getManagerEmails(tenantId: string): Promise<string[]> {
        // Placeholder implementation - replace with actual user repository call
        try {
            // const users = await this.userRepository.findByTenantIdAndRoles(tenantId, ['OWNER', 'MANAGER']);
            // return users.map(user => user.email);
            
            // For now, return a default email
            return ['manager@company.com'];
        } catch (error) {
            console.error('Error getting manager emails:', error);
            return [];
        }
    }

    private generateWeeklyReportHTML(data: WeeklySalesReportData): string {
        return `
            <h2>📊 Weekly Sales Summary</h2>
            <p><strong>Period:</strong> ${data.weekStartDate} to ${data.weekEndDate}</p>
            <p><strong>Total Sales:</strong> ${data.totalSales}</p>
            <p><strong>Total Transactions:</strong> ${data.totalTransactions}</p>
            <p><strong>Average Daily Sales:</strong> ${data.averageDailySales}</p>
            <p><strong>Best Day:</strong> ${data.bestDay} (${data.bestDaySales})</p>
            <p><strong>Growth vs Last Week:</strong> ${data.growthPercentage}%</p>
            
            <h3>Top Products This Week:</h3>
            <ul>
                ${data.topProducts.map(product => `<li>${product.name}: ${product.sales}</li>`).join('')}
            </ul>
        `;
    }

    private generateMonthlyReportHTML(data: MonthlySalesReportData): string {
        return `
            <h2>📈 Monthly Sales Summary</h2>
            <p><strong>Month:</strong> ${data.month} ${data.year}</p>
            <p><strong>Total Sales:</strong> ${data.totalSales}</p>
            <p><strong>Total Transactions:</strong> ${data.totalTransactions}</p>
            <p><strong>Average Daily Sales:</strong> ${data.averageDailySales}</p>
            <p><strong>Growth vs Last Month:</strong> ${data.growthPercentage}%</p>
            <p><strong>Customer Count:</strong> ${data.uniqueCustomers}</p>
            
            <h3>Monthly Highlights:</h3>
            <ul>
                <li>Best Day: ${data.bestDay} (${data.bestDaySales})</li>
                <li>Most Popular Product: ${data.topProduct}</li>
                <li>Average Transaction: ${data.averageTransaction}</li>
            </ul>
        `;
    }
}

// Data interfaces for reports
export interface DailySalesReportData {
    date: string;
    totalSales: string;
    transactionCount: number;
    averageTransaction: string;
    topProduct: string;
    cashSales: string;
    cardSales: string;
    refunds: string;
    netSales: string;
}

export interface WeeklySalesReportData {
    weekStartDate: string;
    weekEndDate: string;
    totalSales: string;
    totalTransactions: number;
    averageDailySales: string;
    bestDay: string;
    bestDaySales: string;
    growthPercentage: string;
    topProducts: Array<{
        name: string;
        sales: string;
    }>;
}

export interface MonthlySalesReportData {
    month: string;
    year: number;
    totalSales: string;
    totalTransactions: number;
    averageDailySales: string;
    growthPercentage: string;
    uniqueCustomers: number;
    bestDay: string;
    bestDaySales: string;
    topProduct: string;
    averageTransaction: string;
}

export const emailReportService = new EmailReportService();