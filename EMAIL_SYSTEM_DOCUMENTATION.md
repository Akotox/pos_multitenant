# Horizon POS Email System Documentation

## Overview
The Horizon POS email system provides comprehensive, enterprise-level email notifications throughout the application. It features professional email templates with the Horizon POS branding and automated email workflows.

## Features

### 🎨 Professional Email Templates
- **Enterprise Design**: Clean, professional templates with Horizon POS branding
- **Responsive Layout**: Mobile-friendly email designs
- **Brand Consistency**: Consistent use of logo, colors, and typography
- **Rich Content**: HTML emails with fallback text versions

### 📧 Email Categories

#### Authentication & User Management
- **Welcome Tenant**: New tenant registration confirmation
- **Welcome User**: New user added to existing tenant
- **Password Reset**: Secure password reset instructions
- **Email Verification**: Account verification emails

#### Subscription & Billing
- **Subscription Activated**: Plan activation confirmation
- **Subscription Renewed**: Renewal confirmation
- **Subscription Expiring**: Expiry warnings (7, 3, 1 days)
- **Payment Success**: Payment confirmation with receipt
- **Payment Failed**: Payment failure alerts with resolution steps

#### Orders & Sales
- **Order Confirmation**: Order receipt and tracking information
- **Order Status Updates**: Shipping, delivery, and status changes
- **Customer Receipts**: Transaction confirmations

#### Inventory Management
- **Low Stock Alerts**: Automated inventory warnings
- **Out of Stock Alerts**: Critical stock notifications
- **Product Updates**: Discontinuation notices

#### Reports & Analytics
- **Daily Sales Reports**: Automated daily summaries
- **Weekly Sales Reports**: Weekly performance analysis
- **Monthly Reports**: Comprehensive monthly analytics

### 🔄 Automated Email Workflows

#### Daily Automation (8:00 AM)
- Daily sales reports sent to managers/owners
- Subscription expiry checks and notifications

#### Inventory Monitoring (Every 4 hours)
- Low stock alerts during business hours (8 AM, 12 PM, 4 PM, 8 PM)
- Out of stock critical alerts

#### Weekly Reports (Mondays 9:00 AM)
- Weekly sales performance summaries
- Trend analysis and insights

#### Monthly Reports (1st of month, 10:00 AM)
- Comprehensive monthly business reports
- Growth metrics and comparisons

## Configuration

### Environment Variables
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@horizonpos.com
SUPPORT_EMAIL=support@horizonpos.com

# Application URLs
FRONTEND_URL=http://localhost:3001
ADMIN_FRONTEND_URL=http://localhost:3002
```

### SMTP Setup
The system supports various SMTP providers:
- **Gmail**: Use app-specific passwords
- **SendGrid**: API key authentication
- **AWS SES**: IAM credentials
- **Custom SMTP**: Any standard SMTP server

## API Endpoints

### Email Health Check
```
GET /health/email
```
Checks SMTP connectivity and email service status.

### Admin Email Management
```
POST /api/v1/admin/email/test
POST /api/v1/admin/email/broadcast
POST /api/v1/admin/email/reports/trigger
GET /api/v1/admin/email/templates
GET /api/v1/admin/email/stats
```

## Integration Points

### 1. User Registration
**Location**: `src/modules/auth/interfaces/auth.controller.ts`
- Sends welcome emails for new tenants and users
- Includes account setup instructions and dashboard access

### 2. Payment Processing
**Location**: `src/modules/payments/interfaces/http/controllers/PaymentsController.ts`
- Payment success confirmations
- Payment failure notifications with resolution steps

### 3. Inventory Management
**Location**: `src/modules/inventory/application/InventoryMonitoringService.ts`
- Automated low stock alerts
- Out of stock critical notifications
- Stock level change triggers

### 4. Sales Reporting
**Location**: `src/modules/reports/application/EmailReportService.ts`
- Daily, weekly, and monthly sales reports
- Performance analytics and insights

### 5. Subscription Management
**Location**: `src/core/jobs/EmailCronJobs.ts`
- Subscription expiry warnings
- Renewal reminders and confirmations

## Email Templates

### Template Structure
All templates follow a consistent structure:
1. **Header**: Horizon POS logo and branding
2. **Content**: Template-specific information
3. **Call-to-Action**: Relevant buttons and links
4. **Footer**: Contact information and unsubscribe options

### Available Templates
- `WELCOME_TENANT`: New tenant onboarding
- `WELCOME_USER`: User account creation
- `PASSWORD_RESET`: Password recovery
- `SUBSCRIPTION_ACTIVATED`: Plan activation
- `SUBSCRIPTION_EXPIRING_SOON`: Expiry warnings
- `PAYMENT_SUCCESS`: Payment confirmations
- `PAYMENT_FAILED`: Payment failures
- `ORDER_CONFIRMATION`: Order receipts
- `LOW_STOCK_ALERT`: Inventory alerts
- `DAILY_SALES_REPORT`: Daily summaries

## Usage Examples

### Send Welcome Email
```typescript
import { emailNotificationService } from './core/services/email/EmailNotificationService';

await emailNotificationService.sendWelcomeTenant({
    email: 'owner@company.com',
    companyName: 'Acme Corp',
    recipientName: 'John Doe',
    planName: 'Professional'
});
```

### Send Low Stock Alert
```typescript
await emailNotificationService.sendLowStockAlert({
    email: ['manager@company.com', 'owner@company.com'],
    recipientName: 'Store Manager',
    productName: 'Premium Coffee',
    currentStock: 5,
    minimumStock: 20
});
```

### Trigger Daily Report
```typescript
import { emailReportService } from './modules/reports/application/EmailReportService';

await emailReportService.sendDailySalesReport('tenant-id', {
    date: '2024-01-15',
    totalSales: '$1,250.00',
    transactionCount: 45,
    averageTransaction: '$27.78',
    topProduct: 'Premium Coffee',
    cashSales: '$450.00',
    cardSales: '$800.00',
    refunds: '$25.00',
    netSales: '$1,225.00'
});
```

## Monitoring & Analytics

### Email Statistics
- Total emails sent
- Success/failure rates
- Template usage statistics
- Delivery performance metrics

### Health Monitoring
- SMTP connection status
- Queue processing status
- Error rate monitoring
- Performance metrics

## Security Features

### Authentication
- JWT-based admin authentication for email management
- Role-based access control for email operations

### Data Protection
- No sensitive data in email logs
- Secure SMTP connections (TLS/SSL)
- Email content sanitization

### Privacy Compliance
- Unsubscribe mechanisms
- Data retention policies
- GDPR compliance features

## Troubleshooting

### Common Issues

#### SMTP Connection Failed
1. Verify SMTP credentials
2. Check firewall settings
3. Ensure correct port and security settings
4. Test with email provider's documentation

#### Emails Not Sending
1. Check email service health endpoint
2. Verify recipient email addresses
3. Review SMTP logs
4. Check rate limiting

#### Template Rendering Issues
1. Verify template variables
2. Check HTML syntax
3. Test with simple templates first

### Debug Endpoints
- `GET /health/email`: Email service status
- `POST /api/v1/admin/email/test`: Send test email
- `GET /api/v1/admin/email/stats`: Email statistics

## Best Practices

### Performance
- Use bulk email operations for multiple recipients
- Implement rate limiting to avoid SMTP throttling
- Queue emails during high-traffic periods

### Deliverability
- Use proper SPF, DKIM, and DMARC records
- Maintain good sender reputation
- Monitor bounce rates and spam complaints

### Content
- Keep subject lines clear and concise
- Use responsive email design
- Include plain text alternatives
- Test across different email clients

## Future Enhancements

### Planned Features
- Email template editor
- A/B testing for email content
- Advanced analytics dashboard
- Email campaign management
- Integration with marketing automation tools

### Scalability Improvements
- Redis queue for email processing
- Multiple SMTP provider failover
- Email delivery optimization
- Advanced tracking and analytics

## Support

For email system support:
- **Technical Issues**: Check logs and health endpoints
- **Configuration Help**: Review environment variables
- **Template Customization**: Modify EmailTemplateService
- **Integration Support**: Follow API documentation

The Horizon POS email system is designed to provide reliable, professional communication with your customers and team members while maintaining the highest standards of deliverability and user experience.