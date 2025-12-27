import { Order, OrderTemplate, OrderMetrics, BulkOrderOperation, OrderStatus, PaymentStatus } from '../entities/Order';

export interface IOrderRepository {
    // Basic CRUD Operations
    create(order: Partial<Order>): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByOrderNumber(orderNumber: string, tenantId: string): Promise<Order | null>;
    update(id: string, data: Partial<Order>): Promise<Order | null>;
    delete(id: string): Promise<boolean>;

    // Query Operations
    findByTenantId(
        tenantId: string, 
        filters?: OrderFilters, 
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }>;
    
    findByCustomerId(
        customerId: string, 
        tenantId: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }>;
    
    findByStatus(
        status: OrderStatus[], 
        tenantId: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }>;
    
    findByPaymentStatus(
        paymentStatus: PaymentStatus[], 
        tenantId: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }>;

    // Advanced Queries
    findOverdueOrders(tenantId: string): Promise<Order[]>;
    findOrdersDueToday(tenantId: string): Promise<Order[]>;
    findPendingApprovalOrders(tenantId: string): Promise<Order[]>;
    findRecurringOrdersDue(): Promise<Order[]>;
    
    // Search
    searchOrders(
        tenantId: string, 
        searchTerm: string, 
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }>;

    // Analytics
    getOrderMetrics(tenantId: string, dateRange?: DateRange): Promise<OrderMetrics>;
    getCustomerOrderSummary(customerId: string, tenantId: string): Promise<any>;
    
    // Order Templates
    createTemplate(template: Partial<OrderTemplate>): Promise<OrderTemplate>;
    findTemplatesByTenantId(tenantId: string): Promise<OrderTemplate[]>;
    updateTemplate(id: string, data: Partial<OrderTemplate>): Promise<OrderTemplate | null>;
    deleteTemplate(id: string): Promise<boolean>;

    // Bulk Operations
    createBulkOperation(operation: Partial<BulkOrderOperation>): Promise<BulkOrderOperation>;
    updateBulkOperation(id: string, data: Partial<BulkOrderOperation>): Promise<BulkOrderOperation | null>;
    findBulkOperationsByTenantId(tenantId: string): Promise<BulkOrderOperation[]>;
}

export interface OrderFilters {
    status?: OrderStatus[];
    paymentStatus?: PaymentStatus[];
    customerId?: string;
    userId?: string;
    priority?: string[];
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    dueDateFrom?: Date;
    dueDateTo?: Date;
    minAmount?: number;
    maxAmount?: number;
    hasApprovalWorkflow?: boolean;
    isRecurring?: boolean;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}