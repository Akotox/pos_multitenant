export interface EmailOptions {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: EmailAttachment[];
}

export interface EmailAttachment {
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
    cid?: string; // Content-ID for inline images
}

export enum EmailTemplate {
    // Authentication & Onboarding
    WELCOME_TENANT = 'welcome-tenant',
    WELCOME_USER = 'welcome-user',
    PASSWORD_RESET = 'password-reset',
    EMAIL_VERIFICATION = 'email-verification',
    
    // Subscription & Billing
    SUBSCRIPTION_ACTIVATED = 'subscription-activated',
    SUBSCRIPTION_RENEWED = 'subscription-renewed',
    SUBSCRIPTION_EXPIRED = 'subscription-expired',
    SUBSCRIPTION_EXPIRING_SOON = 'subscription-expiring-soon',
    PAYMENT_SUCCESS = 'payment-success',
    PAYMENT_FAILED = 'payment-failed',
    
    // Orders & Sales
    ORDER_CONFIRMATION = 'order-confirmation',
    ORDER_STATUS_UPDATE = 'order-status-update',
    ORDER_SHIPPED = 'order-shipped',
    ORDER_DELIVERED = 'order-delivered',
    ORDER_CANCELLED = 'order-cancelled',
    
    // Inventory & Products
    LOW_STOCK_ALERT = 'low-stock-alert',
    OUT_OF_STOCK_ALERT = 'out-of-stock-alert',
    PRODUCT_DISCONTINUED = 'product-discontinued',
    
    // Reports & Analytics
    DAILY_SALES_REPORT = 'daily-sales-report',
    WEEKLY_SALES_REPORT = 'weekly-sales-report',
    MONTHLY_SALES_REPORT = 'monthly-sales-report',
    
    // Admin & System
    SYSTEM_MAINTENANCE = 'system-maintenance',
    SECURITY_ALERT = 'security-alert',
    TENANT_SUSPENDED = 'tenant-suspended',
    TENANT_REACTIVATED = 'tenant-reactivated',
    
    // Customer Communications
    CUSTOMER_RECEIPT = 'customer-receipt',
    CUSTOMER_LOYALTY_REWARD = 'customer-loyalty-reward',
    CUSTOMER_BIRTHDAY = 'customer-birthday',
    
    // Support & Help
    SUPPORT_TICKET_CREATED = 'support-ticket-created',
    SUPPORT_TICKET_RESOLVED = 'support-ticket-resolved',
    FEATURE_ANNOUNCEMENT = 'feature-announcement'
}

export interface EmailTemplateData {
    subject: string;
    html: string;
    text: string;
}

export interface EmailVariables {
    // Common variables
    recipientName?: string;
    companyName?: string;
    tenantName?: string;
    currentDate?: string;
    supportEmail?: string;
    loginUrl?: string;
    dashboardUrl?: string;
    
    // User-specific
    userName?: string;
    userEmail?: string;
    userRole?: string;
    
    // Order-specific
    orderNumber?: string;
    orderTotal?: string;
    orderItems?: Array<{
        name: string;
        quantity: number;
        price: string;
    }>;
    orderDate?: string;
    deliveryDate?: string;
    trackingNumber?: string;
    
    // Subscription-specific
    planName?: string;
    planPrice?: string;
    billingCycle?: string;
    nextBillingDate?: string;
    expirationDate?: string;
    
    // Inventory-specific
    productName?: string;
    currentStock?: number;
    minimumStock?: number;
    
    // Financial
    amount?: string;
    currency?: string;
    paymentMethod?: string;
    invoiceNumber?: string;
    
    // System
    maintenanceStart?: string;
    maintenanceEnd?: string;
    affectedServices?: string[];
    
    // Custom data
    [key: string]: any;
}