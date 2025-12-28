import { Request, Response, NextFunction } from 'express';
import { emailService } from '../../../../core/services/email/EmailService';
import { emailNotificationService } from '../../../../core/services/email/EmailNotificationService';
import { emailReportService } from '../../../reports/application/EmailReportService';
import { emailCronJobs } from '../../../../core/jobs/EmailCronJobs';
import { EmailTemplate } from '../../../../core/services/email/types/EmailTypes';

export class EmailAdminController {

    testEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { testEmail } = req.body;

            if (!testEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Test email address is required'
                });
            }

            // Test basic connectivity
            const isConnected = await emailService.verifyConnection();
            if (!isConnected) {
                return res.status(500).json({
                    success: false,
                    message: 'SMTP connection failed'
                });
            }

            // Send test email
            const testResult = await emailService.sendEmail({
                to: testEmail,
                subject: 'Horizon POS - Email Test',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
                            <img src="https://bronze-keen-ox-570.mypinata.cloud/ipfs/bafkreiftrdzzqk466kwmgpu2nxzvnpmssovmgcgqjgf4wmhad72bwuyq7i" 
                                 alt="Horizon POS" style="max-width: 120px; height: auto; margin-bottom: 10px;">
                            <h1>Email Test Successful! ✅</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p>This is a test email from your Horizon POS system.</p>
                            <p><strong>Test Details:</strong></p>
                            <ul>
                                <li>Sent at: ${new Date().toLocaleString()}</li>
                                <li>SMTP Server: ${process.env.SMTP_HOST}</li>
                                <li>From: ${process.env.SMTP_FROM || process.env.SMTP_USER}</li>
                            </ul>
                            <p>If you received this email, your email configuration is working correctly!</p>
                        </div>
                    </div>
                `,
                text: 'Horizon POS Email Test - If you received this email, your configuration is working correctly!'
            });

            res.json({
                success: testResult,
                message: testResult ? 'Test email sent successfully' : 'Failed to send test email',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    };

    sendBroadcast = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { subject, message, isUrgent = false, targetRole = 'ALL' } = req.body;

            if (!subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject and message are required'
                });
            }

            // Get target emails based on role (placeholder implementation)
            const targetEmails = await this.getTargetEmails(targetRole);

            if (targetEmails.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No target emails found'
                });
            }

            // Send broadcast email
            const result = await emailNotificationService.sendSystemAlert(
                targetEmails,
                subject,
                message,
                isUrgent
            );

            res.json({
                success: result,
                message: result ? 'Broadcast email sent successfully' : 'Failed to send broadcast email',
                recipientCount: targetEmails.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    };

    triggerReports = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reportType, tenantId } = req.body;

            if (!['daily', 'weekly', 'monthly'].includes(reportType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type. Must be daily, weekly, or monthly'
                });
            }

            let results: any = {};

            if (tenantId) {
                // Trigger for specific tenant
                results = await this.triggerReportForTenant(tenantId, reportType);
            } else {
                // Trigger for all tenants
                results = await this.triggerReportForAllTenants(reportType);
            }

            res.json({
                success: true,
                message: `${reportType} reports triggered successfully`,
                results,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    };

    listTemplates = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const templates = [
                {
                    name: EmailTemplate.WELCOME_TENANT,
                    description: 'Welcome email for new tenant registration',
                    category: 'Authentication'
                },
                {
                    name: EmailTemplate.WELCOME_USER,
                    description: 'Welcome email for new user added to tenant',
                    category: 'Authentication'
                },
                {
                    name: EmailTemplate.PASSWORD_RESET,
                    description: 'Password reset instructions',
                    category: 'Authentication'
                },
                {
                    name: EmailTemplate.SUBSCRIPTION_ACTIVATED,
                    description: 'Subscription activation confirmation',
                    category: 'Billing'
                },
                {
                    name: EmailTemplate.SUBSCRIPTION_EXPIRING_SOON,
                    description: 'Subscription expiry warning',
                    category: 'Billing'
                },
                {
                    name: EmailTemplate.PAYMENT_SUCCESS,
                    description: 'Payment confirmation',
                    category: 'Billing'
                },
                {
                    name: EmailTemplate.PAYMENT_FAILED,
                    description: 'Payment failure notification',
                    category: 'Billing'
                },
                {
                    name: EmailTemplate.ORDER_CONFIRMATION,
                    description: 'Order confirmation and receipt',
                    category: 'Orders'
                },
                {
                    name: EmailTemplate.LOW_STOCK_ALERT,
                    description: 'Low stock inventory alert',
                    category: 'Inventory'
                },
                {
                    name: EmailTemplate.DAILY_SALES_REPORT,
                    description: 'Daily sales summary report',
                    category: 'Reports'
                }
            ];

            res.json({
                success: true,
                templates,
                totalCount: templates.length
            });

        } catch (error) {
            next(error);
        }
    };

    getEmailStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const days = parseInt(req.query.days as string) || 7;

            // Placeholder implementation - you would implement actual email tracking
            const stats = {
                totalSent: 1250,
                successRate: 98.5,
                failedCount: 19,
                byTemplate: {
                    [EmailTemplate.WELCOME_TENANT]: 45,
                    [EmailTemplate.DAILY_SALES_REPORT]: 350,
                    [EmailTemplate.LOW_STOCK_ALERT]: 125,
                    [EmailTemplate.PAYMENT_SUCCESS]: 230,
                    [EmailTemplate.SUBSCRIPTION_EXPIRING_SOON]: 15
                },
                byDay: Array.from({ length: days }, (_, i) => ({
                    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    sent: Math.floor(Math.random() * 200) + 50,
                    failed: Math.floor(Math.random() * 10)
                })).reverse(),
                period: `Last ${days} days`,
                lastUpdated: new Date().toISOString()
            };

            res.json({
                success: true,
                stats
            });

        } catch (error) {
            next(error);
        }
    };

    // Helper methods
    private async getTargetEmails(targetRole: string): Promise<string[]> {
        // Placeholder implementation - replace with actual user repository queries
        switch (targetRole) {
            case 'OWNER':
                return ['owner1@company1.com', 'owner2@company2.com'];
            case 'MANAGER':
                return ['manager1@company1.com', 'manager2@company2.com'];
            case 'ALL':
            default:
                return ['owner1@company1.com', 'manager1@company1.com', 'owner2@company2.com'];
        }
    }

    private async triggerReportForTenant(tenantId: string, reportType: string): Promise<any> {
        switch (reportType) {
            case 'daily':
                const dailyData = {
                    date: new Date().toLocaleDateString(),
                    totalSales: '$1,250.00',
                    transactionCount: 45,
                    averageTransaction: '$27.78',
                    topProduct: 'Premium Coffee',
                    cashSales: '$450.00',
                    cardSales: '$800.00',
                    refunds: '$25.00',
                    netSales: '$1,225.00'
                };
                return await emailReportService.sendDailySalesReport(tenantId, dailyData);
            
            case 'weekly':
                const weeklyData = {
                    weekStartDate: '2024-01-01',
                    weekEndDate: '2024-01-07',
                    totalSales: '$8,750.00',
                    totalTransactions: 315,
                    averageDailySales: '$1,250.00',
                    bestDay: 'Friday',
                    bestDaySales: '$1,850.00',
                    growthPercentage: '+12.5',
                    topProducts: [
                        { name: 'Premium Coffee', sales: '$2,100.00' }
                    ]
                };
                return await emailReportService.sendWeeklySalesReport(tenantId, weeklyData);
            
            case 'monthly':
                const monthlyData = {
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
                return await emailReportService.sendMonthlySalesReport(tenantId, monthlyData);
            
            default:
                return false;
        }
    }

    private async triggerReportForAllTenants(reportType: string): Promise<any> {
        // Placeholder - get all active tenants and trigger reports
        const tenants = ['tenant1', 'tenant2', 'tenant3'];
        const results = [];

        for (const tenantId of tenants) {
            const result = await this.triggerReportForTenant(tenantId, reportType);
            results.push({ tenantId, success: result });
        }

        return results;
    }
}