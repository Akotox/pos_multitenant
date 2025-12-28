import { emailService } from './EmailService';
import { EmailTemplate, EmailVariables } from './types/EmailTypes';

export class EmailNotificationService {
    
    // Authentication & User Management
    async sendWelcomeTenant(tenantData: {
        email: string;
        companyName: string;
        recipientName: string;
        planName?: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.WELCOME_TENANT,
            tenantData.email,
            {
                recipientName: tenantData.recipientName,
                companyName: tenantData.companyName,
                userEmail: tenantData.email,
                planName: tenantData.planName || 'Trial'
            }
        );
    }

    async sendWelcomeUser(userData: {
        email: string;
        userName: string;
        companyName: string;
        userRole: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.WELCOME_USER,
            userData.email,
            {
                userName: userData.userName,
                userEmail: userData.email,
                companyName: userData.companyName,
                userRole: userData.userRole
            }
        );
    }

    async sendPasswordReset(email: string, resetUrl: string, userName?: string): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.PASSWORD_RESET,
            email,
            {
                userName,
                userEmail: email,
                resetUrl
            }
        );
    }

    // Subscription & Billing
    async sendSubscriptionActivated(subscriptionData: {
        email: string;
        recipientName: string;
        planName: string;
        billingCycle: string;
        amount: string;
        currency: string;
        nextBillingDate: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.SUBSCRIPTION_ACTIVATED,
            subscriptionData.email,
            subscriptionData
        );
    }

    async sendSubscriptionExpiringSoon(subscriptionData: {
        email: string;
        recipientName: string;
        planName: string;
        expirationDate: string;
        daysRemaining: number;
        renewUrl?: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.SUBSCRIPTION_EXPIRING_SOON,
            subscriptionData.email,
            subscriptionData
        );
    }

    async sendPaymentSuccess(paymentData: {
        email: string;
        recipientName: string;
        amount: string;
        currency: string;
        paymentMethod: string;
        transactionId: string;
        invoiceNumber: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.PAYMENT_SUCCESS,
            paymentData.email,
            paymentData
        );
    }

    async sendPaymentFailed(paymentData: {
        email: string;
        recipientName: string;
        amount: string;
        currency: string;
        paymentMethod: string;
        failureReason?: string;
        gracePeriod?: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.PAYMENT_FAILED,
            paymentData.email,
            paymentData
        );
    }

    // Orders & Sales
    async sendOrderConfirmation(orderData: {
        email: string;
        recipientName: string;
        orderNumber: string;
        orderDate: string;
        orderTotal: string;
        deliveryDate?: string;
        orderItems: Array<{
            name: string;
            quantity: number;
            price: string;
        }>;
        orderTrackingUrl?: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.ORDER_CONFIRMATION,
            orderData.email,
            orderData
        );
    }

    // Inventory Management
    async sendLowStockAlert(inventoryData: {
        email: string | string[];
        recipientName: string;
        productName: string;
        currentStock: number;
        minimumStock: number;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.LOW_STOCK_ALERT,
            inventoryData.email,
            inventoryData
        );
    }

    // Reports & Analytics
    async sendDailySalesReport(reportData: {
        email: string | string[];
        recipientName: string;
        reportDate?: string;
        totalSales?: string;
        transactionCount?: string;
        averageTransaction?: string;
        topProduct?: string;
        cashSales?: string;
        cardSales?: string;
        refunds?: string;
        netSales?: string;
    }): Promise<boolean> {
        return await emailService.sendTemplateEmail(
            EmailTemplate.DAILY_SALES_REPORT,
            reportData.email,
            reportData
        );
    }

    // Bulk notifications
    async sendBulkNotifications(
        template: EmailTemplate,
        recipients: Array<{
            email: string;
            variables: EmailVariables;
        }>
    ): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const recipient of recipients) {
            const result = await emailService.sendTemplateEmail(
                template,
                recipient.email,
                recipient.variables
            );
            
            if (result) {
                success++;
            } else {
                failed++;
            }

            // Small delay to avoid overwhelming SMTP server
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return { success, failed };
    }

    // System notifications
    async sendSystemAlert(
        emails: string | string[],
        subject: string,
        message: string,
        isUrgent: boolean = false
    ): Promise<boolean> {
        const urgentPrefix = isUrgent ? '🚨 URGENT: ' : '';
        
        return await emailService.sendEmail({
            to: emails,
            subject: `${urgentPrefix}${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: ${isUrgent ? '#dc2626' : '#2563eb'}; color: white; padding: 20px; text-align: center;">
                        <h1>Horizon POS ${isUrgent ? 'Alert' : 'Notification'}</h1>
                    </div>
                    <div style="padding: 20px; background: #f9fafb;">
                        <h2>${subject}</h2>
                        <p>${message}</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 12px; color: #6b7280;">
                            This is an automated message from Horizon POS. 
                            If you need assistance, please contact support@horizonpos.com
                        </p>
                    </div>
                </div>
            `,
            text: `${subject}\n\n${message}\n\nThis is an automated message from Horizon POS.`
        });
    }

    // Test email connectivity
    async testEmailConnection(): Promise<boolean> {
        return await emailService.verifyConnection();
    }
}

export const emailNotificationService = new EmailNotificationService();