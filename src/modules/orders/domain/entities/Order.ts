import { Types } from 'mongoose';

export interface Order {
    id?: string;
    orderNumber: string; // Auto-generated unique order number
    tenantId: string;
    customerId: string;
    userId: string; // User who created the order
    
    // Order Details
    items: OrderItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
    
    // Status & Workflow
    status: OrderStatus;
    priority: OrderPriority;
    tags: string[];
    
    // Payment Information
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paymentTerms: PaymentTerms;
    dueDate?: Date;
    paidAmount: number;
    remainingAmount: number;
    
    // Dates
    orderDate: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    
    // Customer Information
    billingAddress: Address;
    shippingAddress?: Address;
    
    // Notes & Communication
    notes?: string;
    internalNotes?: string;
    
    // Enterprise Features
    approvalWorkflow?: ApprovalWorkflow;
    recurringOrder?: RecurringOrderConfig;
    contractId?: string;
    
    // Audit Trail
    statusHistory: OrderStatusHistory[];
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    id?: string;
    productId: string;
    name: string;
    description?: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    subtotal: number;
    total: number;
    
    // Enterprise Features
    customFields?: Record<string, any>;
    serialNumbers?: string[];
    warrantyInfo?: WarrantyInfo;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    contactName?: string;
    contactPhone?: string;
}

export interface WarrantyInfo {
    duration: number; // in months
    type: 'MANUFACTURER' | 'EXTENDED' | 'CUSTOM';
    terms?: string;
}

export enum OrderStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    CONFIRMED = 'CONFIRMED',
    IN_PRODUCTION = 'IN_PRODUCTION',
    READY_TO_SHIP = 'READY_TO_SHIP',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    ON_HOLD = 'ON_HOLD',
    RETURNED = 'RETURNED'
}

export enum OrderPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
    CRITICAL = 'CRITICAL'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CHECK = 'CHECK',
    CREDIT_ACCOUNT = 'CREDIT_ACCOUNT',
    FINANCING = 'FINANCING'
}

export interface PaymentTerms {
    type: PaymentTermsType;
    daysNet?: number; // Net 30, Net 60, etc.
    discountPercent?: number; // Early payment discount
    discountDays?: number; // Days to qualify for discount
    installments?: PaymentInstallment[];
}

export enum PaymentTermsType {
    IMMEDIATE = 'IMMEDIATE',
    NET_DAYS = 'NET_DAYS',
    END_OF_MONTH = 'END_OF_MONTH',
    INSTALLMENTS = 'INSTALLMENTS',
    CUSTOM = 'CUSTOM'
}

export interface PaymentInstallment {
    id?: string;
    amount: number;
    dueDate: Date;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paidDate?: Date;
    paidAmount?: number;
}

// Enterprise Features
export interface ApprovalWorkflow {
    required: boolean;
    currentStep: number;
    totalSteps: number;
    steps: ApprovalStep[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ApprovalStep {
    stepNumber: number;
    approverRole: string;
    approverId?: string;
    approverName?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comments?: string;
    approvedAt?: Date;
    requiredAmount?: number; // Minimum order amount requiring this approval
}

export interface RecurringOrderConfig {
    enabled: boolean;
    frequency: RecurringFrequency;
    interval: number; // Every X frequency (e.g., every 2 weeks)
    nextOrderDate?: Date;
    endDate?: Date;
    maxOccurrences?: number;
    currentOccurrence: number;
    autoApprove: boolean;
}

export enum RecurringFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY'
}

export interface OrderStatusHistory {
    id?: string;
    status: OrderStatus;
    changedBy: string;
    changedByName: string;
    reason?: string;
    notes?: string;
    timestamp: Date;
}

// Order Templates for recurring orders
export interface OrderTemplate {
    id?: string;
    name: string;
    description?: string;
    tenantId: string;
    customerId?: string;
    items: OrderItem[];
    paymentTerms: PaymentTerms;
    tags: string[];
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Order Analytics
export interface OrderMetrics {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    pendingOrders: number;
    overduePayments: number;
    completionRate: number;
    averageDeliveryTime: number; // in days
    topCustomers: CustomerOrderSummary[];
    ordersByStatus: Record<OrderStatus, number>;
    paymentsByStatus: Record<PaymentStatus, number>;
}

export interface CustomerOrderSummary {
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    lastOrderDate: Date;
}

// Bulk Operations
export interface BulkOrderOperation {
    id?: string;
    type: BulkOperationType;
    orderIds: string[];
    parameters: Record<string, any>;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    processedCount: number;
    totalCount: number;
    errors: string[];
    createdBy: string;
    createdAt: Date;
    completedAt?: Date;
}

export enum BulkOperationType {
    UPDATE_STATUS = 'UPDATE_STATUS',
    UPDATE_PRIORITY = 'UPDATE_PRIORITY',
    SEND_NOTIFICATIONS = 'SEND_NOTIFICATIONS',
    EXPORT_ORDERS = 'EXPORT_ORDERS',
    APPLY_DISCOUNT = 'APPLY_DISCOUNT',
    UPDATE_PAYMENT_TERMS = 'UPDATE_PAYMENT_TERMS'
}