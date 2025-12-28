import { EmailTemplate, EmailTemplateData, EmailVariables } from './types/EmailTypes';

export class EmailTemplateService {
    private readonly logoUrl = 'https://bronze-keen-ox-570.mypinata.cloud/ipfs/bafkreiftrdzzqk466kwmgpu2nxzvnpmssovmgcgqjgf4wmhad72bwuyq7i';
    private readonly appName = 'Horizon POS';
    private readonly primaryColor = '#2563eb';
    private readonly secondaryColor = '#f8fafc';

    async renderTemplate(template: EmailTemplate, variables: EmailVariables): Promise<EmailTemplateData> {
        const baseVariables = {
            ...variables,
            appName: this.appName,
            logoUrl: this.logoUrl,
            currentYear: new Date().getFullYear(),
            supportEmail: process.env.SUPPORT_EMAIL || 'support@horizonpos.com',
            dashboardUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
            currentDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        switch (template) {
            case EmailTemplate.WELCOME_TENANT:
                return this.renderWelcomeTenant(baseVariables);
            case EmailTemplate.WELCOME_USER:
                return this.renderWelcomeUser(baseVariables);
            case EmailTemplate.PASSWORD_RESET:
                return this.renderPasswordReset(baseVariables);
            case EmailTemplate.SUBSCRIPTION_ACTIVATED:
                return this.renderSubscriptionActivated(baseVariables);
            case EmailTemplate.SUBSCRIPTION_EXPIRING_SOON:
                return this.renderSubscriptionExpiringSoon(baseVariables);
            case EmailTemplate.ORDER_CONFIRMATION:
                return this.renderOrderConfirmation(baseVariables);
            case EmailTemplate.LOW_STOCK_ALERT:
                return this.renderLowStockAlert(baseVariables);
            case EmailTemplate.DAILY_SALES_REPORT:
                return this.renderDailySalesReport(baseVariables);
            case EmailTemplate.PAYMENT_SUCCESS:
                return this.renderPaymentSuccess(baseVariables);
            case EmailTemplate.PAYMENT_FAILED:
                return this.renderPaymentFailed(baseVariables);
            default:
                throw new Error(`Template ${template} not implemented`);
        }
    }

    private getBaseTemplate(content: string, variables: EmailVariables): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${variables.appName}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: linear-gradient(135deg, ${this.primaryColor} 0%, #1d4ed8 100%);
                    padding: 30px 40px;
                    text-align: center;
                }
                .logo {
                    max-width: 120px;
                    height: auto;
                    margin-bottom: 10px;
                }
                .header-title {
                    color: white;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0;
                }
                .content {
                    padding: 40px;
                }
                .content h1 {
                    color: ${this.primaryColor};
                    font-size: 28px;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .content h2 {
                    color: #374151;
                    font-size: 20px;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }
                .content p {
                    margin-bottom: 16px;
                    color: #4b5563;
                }
                .button {
                    display: inline-block;
                    background-color: ${this.primaryColor};
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #1d4ed8;
                }
                .info-box {
                    background-color: ${this.secondaryColor};
                    border-left: 4px solid ${this.primaryColor};
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 0 6px 6px 0;
                }
                .alert-box {
                    background-color: #fef2f2;
                    border-left: 4px solid #ef4444;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 0 6px 6px 0;
                }
                .success-box {
                    background-color: #f0fdf4;
                    border-left: 4px solid #22c55e;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 0 6px 6px 0;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .table th,
                .table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }
                .table th {
                    background-color: ${this.secondaryColor};
                    font-weight: 600;
                    color: #374151;
                }
                .footer {
                    background-color: #f9fafb;
                    padding: 30px 40px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }
                .footer p {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 5px 0;
                }
                .social-links {
                    margin: 20px 0;
                }
                .social-links a {
                    color: ${this.primaryColor};
                    text-decoration: none;
                    margin: 0 10px;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 0;
                        box-shadow: none;
                    }
                    .header,
                    .content,
                    .footer {
                        padding: 20px;
                    }
                    .content h1 {
                        font-size: 24px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${variables.logoUrl}" alt="${variables.appName}" class="logo">
                    <h1 class="header-title">${variables.appName}</h1>
                </div>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <p><strong>${variables.appName}</strong> - Your Complete POS Solution</p>
                    <p>© ${variables.currentYear} ${variables.appName}. All rights reserved.</p>
                    <div class="social-links">
                        <a href="mailto:${variables.supportEmail}">Support</a> |
                        <a href="${variables.dashboardUrl}">Dashboard</a> |
                        <a href="${variables.dashboardUrl}/help">Help Center</a>
                    </div>
                    <p style="font-size: 12px; color: #9ca3af;">
                        This email was sent to ${variables.userEmail || variables.recipientName}. 
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private renderWelcomeTenant(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Welcome to ${variables.appName}! 🎉</h1>
            <p>Dear ${variables.recipientName || variables.companyName},</p>
            <p>Congratulations! Your ${variables.appName} account has been successfully created. We're excited to help you streamline your business operations with our comprehensive POS solution.</p>
            
            <div class="success-box">
                <h2>🚀 Your Account Details</h2>
                <p><strong>Company:</strong> ${variables.companyName}</p>
                <p><strong>Email:</strong> ${variables.userEmail}</p>
                <p><strong>Plan:</strong> ${variables.planName || 'Trial'}</p>
                <p><strong>Setup Date:</strong> ${variables.currentDate}</p>
            </div>

            <h2>🎯 Next Steps</h2>
            <p>To get started with your new POS system:</p>
            <ol>
                <li><strong>Access your dashboard</strong> using the button below</li>
                <li><strong>Complete your profile</strong> and business settings</li>
                <li><strong>Add your first products</strong> to the inventory</li>
                <li><strong>Set up your categories</strong> and pricing</li>
                <li><strong>Start processing sales</strong> immediately</li>
            </ol>

            <a href="${variables.dashboardUrl}" class="button">Access Your Dashboard</a>

            <div class="info-box">
                <h2>💡 Pro Tips</h2>
                <ul>
                    <li>Import your existing product catalog using our CSV import feature</li>
                    <li>Set up user roles for your team members</li>
                    <li>Configure your receipt templates and branding</li>
                    <li>Explore our advanced reporting features</li>
                </ul>
            </div>

            <p>If you need any assistance getting started, our support team is here to help. Simply reply to this email or visit our help center.</p>
            <p>Welcome aboard!</p>
            <p><strong>The ${variables.appName} Team</strong></p>
        `;

        return {
            subject: `Welcome to ${variables.appName} - Your POS System is Ready!`,
            html: this.getBaseTemplate(content, variables),
            text: `Welcome to ${variables.appName}! Your account has been created successfully. Access your dashboard at ${variables.dashboardUrl}`
        };
    }

    private renderWelcomeUser(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Welcome to the Team! 👋</h1>
            <p>Hello ${variables.userName},</p>
            <p>You've been added to <strong>${variables.companyName}</strong>'s ${variables.appName} system as a <strong>${variables.userRole}</strong>.</p>
            
            <div class="info-box">
                <h2>👤 Your Account Information</h2>
                <p><strong>Name:</strong> ${variables.userName}</p>
                <p><strong>Email:</strong> ${variables.userEmail}</p>
                <p><strong>Role:</strong> ${variables.userRole}</p>
                <p><strong>Company:</strong> ${variables.companyName}</p>
            </div>

            <p>You can now access the POS system and start working with your team. Your role gives you access to specific features based on your responsibilities.</p>

            <a href="${variables.loginUrl || variables.dashboardUrl}" class="button">Login to Your Account</a>

            <h2>🔐 Security Reminder</h2>
            <p>For your account security:</p>
            <ul>
                <li>Keep your login credentials secure</li>
                <li>Log out when using shared devices</li>
                <li>Report any suspicious activity immediately</li>
            </ul>

            <p>If you have any questions about using the system, don't hesitate to reach out to your manager or our support team.</p>
            <p>Welcome to ${variables.appName}!</p>
        `;

        return {
            subject: `Welcome to ${variables.companyName} - ${variables.appName} Access`,
            html: this.getBaseTemplate(content, variables),
            text: `Welcome to ${variables.companyName}! You now have access to ${variables.appName} as a ${variables.userRole}. Login at ${variables.loginUrl || variables.dashboardUrl}`
        };
    }

    private renderPasswordReset(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Password Reset Request 🔐</h1>
            <p>Hello ${variables.userName || variables.recipientName},</p>
            <p>We received a request to reset your password for your ${variables.appName} account.</p>
            
            <div class="alert-box">
                <h2>⚠️ Security Notice</h2>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>

            <p>To reset your password, click the button below. This link will expire in 1 hour for security reasons.</p>

            <a href="${variables.resetUrl}" class="button">Reset Your Password</a>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${variables.resetUrl}</p>

            <h2>🛡️ Security Tips</h2>
            <ul>
                <li>Choose a strong, unique password</li>
                <li>Don't share your password with anyone</li>
                <li>Use a password manager if possible</li>
                <li>Enable two-factor authentication when available</li>
            </ul>

            <p>If you continue to have trouble accessing your account, please contact our support team.</p>
        `;

        return {
            subject: `${variables.appName} - Password Reset Request`,
            html: this.getBaseTemplate(content, variables),
            text: `Password reset requested for ${variables.appName}. Reset your password: ${variables.resetUrl}`
        };
    }

    private renderSubscriptionActivated(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Subscription Activated! 🎉</h1>
            <p>Great news, ${variables.recipientName}!</p>
            <p>Your ${variables.appName} subscription has been successfully activated. You now have full access to all the features included in your plan.</p>
            
            <div class="success-box">
                <h2>📋 Subscription Details</h2>
                <p><strong>Plan:</strong> ${variables.planName}</p>
                <p><strong>Billing Cycle:</strong> ${variables.billingCycle}</p>
                <p><strong>Amount:</strong> ${variables.amount} ${variables.currency}</p>
                <p><strong>Next Billing:</strong> ${variables.nextBillingDate}</p>
            </div>

            <h2>✨ What's Included</h2>
            <p>Your ${variables.planName} plan includes:</p>
            <ul>
                <li>Unlimited product catalog</li>
                <li>Advanced reporting and analytics</li>
                <li>Multi-user access</li>
                <li>Customer management</li>
                <li>Inventory tracking</li>
                <li>24/7 customer support</li>
            </ul>

            <a href="${variables.dashboardUrl}" class="button">Access Your Dashboard</a>

            <p>Thank you for choosing ${variables.appName}. We're committed to helping your business succeed!</p>
        `;

        return {
            subject: `${variables.appName} - Subscription Activated Successfully`,
            html: this.getBaseTemplate(content, variables),
            text: `Your ${variables.appName} subscription (${variables.planName}) has been activated. Next billing: ${variables.nextBillingDate}`
        };
    }

    private renderSubscriptionExpiringSoon(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Subscription Expiring Soon ⏰</h1>
            <p>Hello ${variables.recipientName},</p>
            <p>This is a friendly reminder that your ${variables.appName} subscription will expire soon.</p>
            
            <div class="alert-box">
                <h2>⚠️ Action Required</h2>
                <p><strong>Plan:</strong> ${variables.planName}</p>
                <p><strong>Expiration Date:</strong> ${variables.expirationDate}</p>
                <p><strong>Days Remaining:</strong> ${variables.daysRemaining}</p>
            </div>

            <p>To avoid any interruption to your service, please renew your subscription before the expiration date.</p>

            <a href="${variables.renewUrl || variables.dashboardUrl + '/billing'}" class="button">Renew Subscription</a>

            <h2>💡 Why Renew?</h2>
            <ul>
                <li>Maintain uninterrupted access to your POS system</li>
                <li>Keep all your data and settings</li>
                <li>Continue receiving updates and new features</li>
                <li>Maintain customer support access</li>
            </ul>

            <p>If you have any questions about renewal or need assistance, our support team is ready to help.</p>
        `;

        return {
            subject: `${variables.appName} - Subscription Expiring in ${variables.daysRemaining} Days`,
            html: this.getBaseTemplate(content, variables),
            text: `Your ${variables.appName} subscription expires on ${variables.expirationDate}. Renew at ${variables.renewUrl || variables.dashboardUrl + '/billing'}`
        };
    }

    private renderOrderConfirmation(variables: EmailVariables): EmailTemplateData {
        const itemsHtml = variables.orderItems?.map(item => `
            <tr>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.price}</td>
            </tr>
        `).join('') || '';

        const content = `
            <h1>Order Confirmation 📋</h1>
            <p>Hello ${variables.recipientName},</p>
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            
            <div class="info-box">
                <h2>📦 Order Details</h2>
                <p><strong>Order Number:</strong> ${variables.orderNumber}</p>
                <p><strong>Order Date:</strong> ${variables.orderDate}</p>
                <p><strong>Total Amount:</strong> ${variables.orderTotal}</p>
                <p><strong>Expected Delivery:</strong> ${variables.deliveryDate || 'TBD'}</p>
            </div>

            <h2>🛍️ Items Ordered</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <p>We'll send you another email with tracking information once your order ships.</p>
            
            <a href="${variables.orderTrackingUrl || variables.dashboardUrl + '/orders/' + variables.orderNumber}" class="button">Track Your Order</a>

            <p>Thank you for your business!</p>
        `;

        return {
            subject: `Order Confirmation - ${variables.orderNumber}`,
            html: this.getBaseTemplate(content, variables),
            text: `Order ${variables.orderNumber} confirmed. Total: ${variables.orderTotal}. Track at ${variables.orderTrackingUrl}`
        };
    }

    private renderLowStockAlert(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Low Stock Alert ⚠️</h1>
            <p>Hello ${variables.recipientName},</p>
            <p>This is an automated alert to inform you that one of your products is running low on stock.</p>
            
            <div class="alert-box">
                <h2>📦 Stock Alert</h2>
                <p><strong>Product:</strong> ${variables.productName}</p>
                <p><strong>Current Stock:</strong> ${variables.currentStock} units</p>
                <p><strong>Minimum Stock Level:</strong> ${variables.minimumStock} units</p>
                <p><strong>Status:</strong> ${variables.currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}</p>
            </div>

            <h2>🎯 Recommended Actions</h2>
            <ul>
                <li>Reorder stock from your supplier</li>
                <li>Update product availability if needed</li>
                <li>Consider adjusting minimum stock levels</li>
                <li>Review sales trends for this product</li>
            </ul>

            <a href="${variables.dashboardUrl}/inventory" class="button">Manage Inventory</a>

            <p>Staying on top of inventory levels helps ensure you never miss a sale due to stock shortages.</p>
        `;

        return {
            subject: `${variables.currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'} Alert - ${variables.productName}`,
            html: this.getBaseTemplate(content, variables),
            text: `${variables.productName} is ${variables.currentStock === 0 ? 'out of stock' : 'low on stock'} (${variables.currentStock} units remaining)`
        };
    }

    private renderDailySalesReport(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Daily Sales Report 📊</h1>
            <p>Hello ${variables.recipientName},</p>
            <p>Here's your daily sales summary for ${variables.reportDate || variables.currentDate}.</p>
            
            <div class="success-box">
                <h2>💰 Sales Summary</h2>
                <p><strong>Total Sales:</strong> ${variables.totalSales || '$0.00'}</p>
                <p><strong>Number of Transactions:</strong> ${variables.transactionCount || '0'}</p>
                <p><strong>Average Transaction:</strong> ${variables.averageTransaction || '$0.00'}</p>
                <p><strong>Top Product:</strong> ${variables.topProduct || 'N/A'}</p>
            </div>

            <h2>📈 Key Metrics</h2>
            <table class="table">
                <tr>
                    <td><strong>Cash Sales</strong></td>
                    <td style="text-align: right;">${variables.cashSales || '$0.00'}</td>
                </tr>
                <tr>
                    <td><strong>Card Sales</strong></td>
                    <td style="text-align: right;">${variables.cardSales || '$0.00'}</td>
                </tr>
                <tr>
                    <td><strong>Returns/Refunds</strong></td>
                    <td style="text-align: right;">${variables.refunds || '$0.00'}</td>
                </tr>
                <tr>
                    <td><strong>Net Sales</strong></td>
                    <td style="text-align: right;"><strong>${variables.netSales || '$0.00'}</strong></td>
                </tr>
            </table>

            <a href="${variables.dashboardUrl}/reports" class="button">View Detailed Reports</a>

            <p>Keep up the great work! For more detailed analytics, visit your dashboard.</p>
        `;

        return {
            subject: `Daily Sales Report - ${variables.reportDate || variables.currentDate}`,
            html: this.getBaseTemplate(content, variables),
            text: `Daily sales report: ${variables.totalSales} in ${variables.transactionCount} transactions. View details at ${variables.dashboardUrl}/reports`
        };
    }

    private renderPaymentSuccess(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Payment Successful! ✅</h1>
            <p>Hello ${variables.recipientName},</p>
            <p>We've successfully processed your payment. Thank you for your business!</p>
            
            <div class="success-box">
                <h2>💳 Payment Details</h2>
                <p><strong>Amount:</strong> ${variables.amount} ${variables.currency}</p>
                <p><strong>Payment Method:</strong> ${variables.paymentMethod}</p>
                <p><strong>Transaction ID:</strong> ${variables.transactionId}</p>
                <p><strong>Date:</strong> ${variables.currentDate}</p>
                <p><strong>Invoice:</strong> ${variables.invoiceNumber}</p>
            </div>

            <p>Your payment has been applied to your account and your services will continue uninterrupted.</p>

            <a href="${variables.dashboardUrl}/billing" class="button">View Billing History</a>

            <p>A receipt for this payment has been attached to this email for your records.</p>
            <p>Thank you for choosing ${variables.appName}!</p>
        `;

        return {
            subject: `Payment Successful - ${variables.amount} ${variables.currency}`,
            html: this.getBaseTemplate(content, variables),
            text: `Payment of ${variables.amount} ${variables.currency} processed successfully. Transaction ID: ${variables.transactionId}`
        };
    }

    private renderPaymentFailed(variables: EmailVariables): EmailTemplateData {
        const content = `
            <h1>Payment Failed ❌</h1>
            <p>Hello ${variables.recipientName},</p>
            <p>We were unable to process your recent payment. Your account may be affected if this issue isn't resolved.</p>
            
            <div class="alert-box">
                <h2>⚠️ Payment Issue</h2>
                <p><strong>Amount:</strong> ${variables.amount} ${variables.currency}</p>
                <p><strong>Payment Method:</strong> ${variables.paymentMethod}</p>
                <p><strong>Reason:</strong> ${variables.failureReason || 'Payment declined'}</p>
                <p><strong>Date:</strong> ${variables.currentDate}</p>
            </div>

            <h2>🔧 How to Resolve</h2>
            <ol>
                <li>Check that your payment method has sufficient funds</li>
                <li>Verify your billing information is up to date</li>
                <li>Try a different payment method</li>
                <li>Contact your bank if the issue persists</li>
            </ol>

            <a href="${variables.dashboardUrl}/billing" class="button">Update Payment Method</a>

            <div class="info-box">
                <h2>⏰ Grace Period</h2>
                <p>Your account will remain active for ${variables.gracePeriod || '7 days'} while you resolve this payment issue. After this period, some features may be temporarily disabled.</p>
            </div>

            <p>If you need assistance, please contact our support team immediately.</p>
        `;

        return {
            subject: `Payment Failed - Action Required`,
            html: this.getBaseTemplate(content, variables),
            text: `Payment of ${variables.amount} ${variables.currency} failed. Please update your payment method at ${variables.dashboardUrl}/billing`
        };
    }
}