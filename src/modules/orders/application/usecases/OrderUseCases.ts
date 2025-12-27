import { IOrderRepository, OrderFilters, PaginationOptions } from '../../domain/repositories/IOrderRepository';
import { 
    Order, 
    OrderTemplate, 
    OrderStatus, 
    PaymentStatus, 
    OrderPriority,
    PaymentTermsType,
    RecurringFrequency,
    BulkOrderOperation,
    BulkOperationType,
    OrderStatusHistory
} from '../../domain/entities/Order';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../../../core/errors/app-error';
import { ProductModel } from '../../../products/infrastructure/product.model';
import { CustomerModel } from '../../../customers/infrastructure/database/models/CustomerModel';

export class OrderUseCases {
    constructor(private orderRepository: IOrderRepository) {}

    // Order Management
    async createOrder(orderData: Partial<Order>, userId: string): Promise<Order> {
        // Validate customer exists
        const customer = await CustomerModel.findById(orderData.customerId);
        if (!customer) {
            throw new NotFoundError('Customer not found');
        }

        // Generate unique order number
        const orderNumber = await this.generateOrderNumber(orderData.tenantId!);

        // Calculate totals
        const calculatedTotals = await this.calculateOrderTotals(orderData.items || []);

        // Set default payment terms if not provided
        const paymentTerms = orderData.paymentTerms || {
            type: PaymentTermsType.NET_DAYS,
            daysNet: 30
        };

        // Calculate due date based on payment terms
        const dueDate = this.calculateDueDate(paymentTerms);

        // Create status history entry
        const statusHistory: OrderStatusHistory[] = [{
            status: OrderStatus.DRAFT,
            changedBy: userId,
            changedByName: 'System', // Should be populated with actual user name
            reason: 'Order created',
            timestamp: new Date()
        }];

        const order: Partial<Order> = {
            ...orderData,
            orderNumber,
            userId,
            ...calculatedTotals,
            status: OrderStatus.DRAFT,
            priority: orderData.priority || OrderPriority.NORMAL,
            paymentStatus: PaymentStatus.PENDING,
            paymentTerms,
            dueDate,
            paidAmount: 0,
            remainingAmount: calculatedTotals.totalAmount,
            orderDate: new Date(),
            statusHistory
        };

        // Check if approval workflow is required
        if (await this.requiresApproval(order)) {
            order.approvalWorkflow = await this.createApprovalWorkflow(order);
            order.status = OrderStatus.PENDING_APPROVAL;
        }

        return await this.orderRepository.create(order);
    }

    async updateOrder(id: string, data: Partial<Order>, userId: string): Promise<Order> {
        const existingOrder = await this.orderRepository.findById(id);
        if (!existingOrder) {
            throw new NotFoundError('Order not found');
        }

        // Check if order can be modified
        if (!this.canModifyOrder(existingOrder.status)) {
            throw new BadRequestError('Order cannot be modified in current status');
        }

        // Recalculate totals if items changed
        if (data.items) {
            const calculatedTotals = await this.calculateOrderTotals(data.items);
            Object.assign(data, calculatedTotals);
            data.remainingAmount = calculatedTotals.totalAmount - (existingOrder.paidAmount || 0);
        }

        // Update due date if payment terms changed
        if (data.paymentTerms) {
            data.dueDate = this.calculateDueDate(data.paymentTerms);
        }

        const updatedOrder = await this.orderRepository.update(id, data);
        if (!updatedOrder) {
            throw new NotFoundError('Order not found or could not be updated');
        }
        
        return updatedOrder;
    }

    async updateOrderStatus(id: string, newStatus: OrderStatus, userId: string, reason?: string, notes?: string): Promise<Order> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Validate status transition
        if (!this.isValidStatusTransition(order.status, newStatus)) {
            throw new BadRequestError(`Invalid status transition from ${order.status} to ${newStatus}`);
        }

        // Add to status history
        const statusHistoryEntry: OrderStatusHistory = {
            status: newStatus,
            changedBy: userId,
            changedByName: 'User', // Should be populated with actual user name
            reason,
            notes,
            timestamp: new Date()
        };

        const updatedOrder = await this.orderRepository.update(id, {
            status: newStatus,
            statusHistory: [...(order.statusHistory || []), statusHistoryEntry]
        });

        // Handle status-specific logic
        await this.handleStatusChange(updatedOrder!, newStatus);

        return updatedOrder!;
    }

    async deleteOrder(id: string): Promise<void> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (!this.canDeleteOrder(order.status)) {
            throw new BadRequestError('Order cannot be deleted in current status');
        }

        await this.orderRepository.delete(id);
    }

    // Query Operations
    async getOrderById(id: string): Promise<Order> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        return order;
    }

    async getOrderByNumber(orderNumber: string, tenantId: string): Promise<Order> {
        const order = await this.orderRepository.findByOrderNumber(orderNumber, tenantId);
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        return order;
    }

    async getOrdersByTenant(
        tenantId: string,
        filters?: OrderFilters,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number; pages: number }> {
        const result = await this.orderRepository.findByTenantId(tenantId, filters, pagination);
        const pages = Math.ceil(result.total / (pagination?.limit || 10));
        return { ...result, pages };
    }

    async getOrdersByCustomer(
        customerId: string,
        tenantId: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number; pages: number }> {
        const result = await this.orderRepository.findByCustomerId(customerId, tenantId, pagination);
        const pages = Math.ceil(result.total / (pagination?.limit || 10));
        return { ...result, pages };
    }

    async searchOrders(
        tenantId: string,
        searchTerm: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number; pages: number }> {
        const result = await this.orderRepository.searchOrders(tenantId, searchTerm, pagination);
        const pages = Math.ceil(result.total / (pagination?.limit || 10));
        return { ...result, pages };
    }

    // Payment Management
    async recordPayment(
        orderId: string,
        amount: number,
        paymentMethod: string,
        userId: string,
        notes?: string
    ): Promise<Order> {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (amount <= 0) {
            throw new BadRequestError('Payment amount must be greater than 0');
        }

        if (amount > order.remainingAmount) {
            throw new BadRequestError('Payment amount exceeds remaining balance');
        }

        const newPaidAmount = order.paidAmount + amount;
        const newRemainingAmount = order.totalAmount - newPaidAmount;
        
        let newPaymentStatus = PaymentStatus.PARTIAL;
        if (newRemainingAmount === 0) {
            newPaymentStatus = PaymentStatus.PAID;
        } else if (newPaidAmount === 0) {
            newPaymentStatus = PaymentStatus.PENDING;
        }

        // Update installments if applicable
        const updatedPaymentTerms = this.updateInstallmentPayments(order.paymentTerms, amount);

        const updatedOrder = await this.orderRepository.update(orderId, {
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            paymentStatus: newPaymentStatus,
            paymentTerms: updatedPaymentTerms
        });
        
        if (!updatedOrder) {
            throw new NotFoundError('Order not found or could not be updated');
        }
        
        return updatedOrder;
    }

    // Approval Workflow
    async approveOrder(orderId: string, approverId: string, comments?: string): Promise<Order> {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (!order.approvalWorkflow || order.approvalWorkflow.status !== 'PENDING') {
            throw new BadRequestError('Order does not require approval or is already processed');
        }

        const workflow = order.approvalWorkflow;
        const currentStep = workflow.steps[workflow.currentStep - 1];
        
        if (!currentStep) {
            throw new BadRequestError('Invalid approval step');
        }

        // Update current step
        currentStep.status = 'APPROVED';
        currentStep.approverId = approverId;
        currentStep.comments = comments;
        currentStep.approvedAt = new Date();

        // Check if all steps are completed
        if (workflow.currentStep >= workflow.totalSteps) {
            workflow.status = 'APPROVED';
            return await this.updateOrderStatus(orderId, OrderStatus.APPROVED, approverId, 'Order approved');
        } else {
            // Move to next step
            workflow.currentStep += 1;
            const updatedOrder = await this.orderRepository.update(orderId, { approvalWorkflow: workflow });
            
            if (!updatedOrder) {
                throw new NotFoundError('Order not found or could not be updated');
            }
            
            return updatedOrder;
        }
    }

    async rejectOrder(orderId: string, approverId: string, reason: string): Promise<Order> {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (!order.approvalWorkflow || order.approvalWorkflow.status !== 'PENDING') {
            throw new BadRequestError('Order does not require approval or is already processed');
        }

        const workflow = order.approvalWorkflow;
        const currentStep = workflow.steps[workflow.currentStep - 1];
        
        currentStep.status = 'REJECTED';
        currentStep.approverId = approverId;
        currentStep.comments = reason;
        currentStep.approvedAt = new Date();

        workflow.status = 'REJECTED';

        await this.orderRepository.update(orderId, { approvalWorkflow: workflow });
        return await this.updateOrderStatus(orderId, OrderStatus.CANCELLED, approverId, 'Order rejected', reason);
    }

    // Templates
    async createTemplate(templateData: Partial<OrderTemplate>): Promise<OrderTemplate> {
        return await this.orderRepository.createTemplate(templateData);
    }

    async getTemplatesByTenant(tenantId: string): Promise<OrderTemplate[]> {
        return await this.orderRepository.findTemplatesByTenantId(tenantId);
    }

    async createOrderFromTemplate(templateId: string, customerId: string, userId: string): Promise<Order> {
        const template = await this.orderRepository.findTemplatesByTenantId(''); // Need to implement findTemplateById
        if (!template) {
            throw new NotFoundError('Template not found');
        }

        const orderData: Partial<Order> = {
            tenantId: template[0].tenantId, // This needs proper implementation
            customerId,
            items: template[0].items,
            paymentTerms: template[0].paymentTerms,
            tags: template[0].tags,
            billingAddress: {} as any, // Need to get from customer
            notes: `Created from template: ${template[0].name}`
        };

        return await this.createOrder(orderData, userId);
    }

    // Analytics
    async getOrderMetrics(tenantId: string, dateRange?: { startDate: Date; endDate: Date }) {
        return await this.orderRepository.getOrderMetrics(tenantId, dateRange);
    }

    async getOverdueOrders(tenantId: string): Promise<Order[]> {
        return await this.orderRepository.findOverdueOrders(tenantId);
    }

    async getOrdersDueToday(tenantId: string): Promise<Order[]> {
        return await this.orderRepository.findOrdersDueToday(tenantId);
    }

    async getPendingApprovalOrders(tenantId: string): Promise<Order[]> {
        return await this.orderRepository.findPendingApprovalOrders(tenantId);
    }

    // Recurring Orders
    async processRecurringOrders(): Promise<void> {
        const recurringOrders = await this.orderRepository.findRecurringOrdersDue();
        
        for (const order of recurringOrders) {
            try {
                await this.createRecurringOrderInstance(order);
            } catch (error) {
                console.error(`Failed to create recurring order instance for order ${order.id}:`, error);
            }
        }
    }

    // Bulk Operations
    async createBulkOperation(
        type: BulkOperationType,
        orderIds: string[],
        parameters: Record<string, any>,
        userId: string
    ): Promise<BulkOrderOperation> {
        return await this.orderRepository.createBulkOperation({
            type,
            orderIds,
            parameters,
            totalCount: orderIds.length,
            createdBy: userId
        });
    }

    // Helper Methods
    private async generateOrderNumber(tenantId: string): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Get count of orders today for this tenant
        const todayStart = new Date(year, date.getMonth(), date.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        
        const { total } = await this.orderRepository.findByTenantId(tenantId, {
            dateFrom: todayStart,
            dateTo: todayEnd
        });
        
        const sequence = String(total + 1).padStart(4, '0');
        return `ORD-${year}${month}${day}-${sequence}`;
    }

    private async calculateOrderTotals(items: any[]): Promise<{
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
    }> {
        let subtotal = 0;
        let taxAmount = 0;

        for (const item of items) {
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemDiscount = (itemSubtotal * item.discountPercent) / 100;
            const itemAfterDiscount = itemSubtotal - itemDiscount;
            const itemTax = (itemAfterDiscount * item.taxPercent) / 100;
            
            item.subtotal = itemSubtotal;
            item.discountAmount = itemDiscount;
            item.taxAmount = itemTax;
            item.total = itemAfterDiscount + itemTax;
            
            subtotal += itemSubtotal;
            taxAmount += itemTax;
        }

        return {
            subtotal,
            taxAmount,
            totalAmount: subtotal - (items.reduce((sum, item) => sum + item.discountAmount, 0)) + taxAmount
        };
    }

    private calculateDueDate(paymentTerms: any): Date {
        const now = new Date();
        
        switch (paymentTerms.type) {
            case PaymentTermsType.IMMEDIATE:
                return now;
            case PaymentTermsType.NET_DAYS:
                const dueDate = new Date(now);
                dueDate.setDate(dueDate.getDate() + (paymentTerms.daysNet || 30));
                return dueDate;
            case PaymentTermsType.END_OF_MONTH:
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return endOfMonth;
            default:
                const defaultDue = new Date(now);
                defaultDue.setDate(defaultDue.getDate() + 30);
                return defaultDue;
        }
    }

    private async requiresApproval(order: Partial<Order>): Promise<boolean> {
        // Implement approval logic based on order amount, customer, etc.
        return (order.totalAmount || 0) > 10000; // Example: orders over $10,000 require approval
    }

    private async createApprovalWorkflow(order: Partial<Order>): Promise<any> {
        // Create approval workflow based on business rules
        return {
            required: true,
            currentStep: 1,
            totalSteps: 2,
            steps: [
                {
                    stepNumber: 1,
                    approverRole: 'MANAGER',
                    status: 'PENDING',
                    requiredAmount: 10000
                },
                {
                    stepNumber: 2,
                    approverRole: 'OWNER',
                    status: 'PENDING',
                    requiredAmount: 50000
                }
            ],
            status: 'PENDING'
        };
    }

    private canModifyOrder(status: OrderStatus): boolean {
        return [OrderStatus.DRAFT, OrderStatus.PENDING_APPROVAL].includes(status);
    }

    private canDeleteOrder(status: OrderStatus): boolean {
        return [OrderStatus.DRAFT, OrderStatus.CANCELLED].includes(status);
    }

    private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.DRAFT]: [OrderStatus.PENDING_APPROVAL, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.PENDING_APPROVAL]: [OrderStatus.APPROVED, OrderStatus.CANCELLED],
            [OrderStatus.APPROVED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED],
            [OrderStatus.IN_PRODUCTION]: [OrderStatus.READY_TO_SHIP, OrderStatus.ON_HOLD],
            [OrderStatus.READY_TO_SHIP]: [OrderStatus.SHIPPED, OrderStatus.ON_HOLD],
            [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
            [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
            [OrderStatus.COMPLETED]: [],
            [OrderStatus.CANCELLED]: [],
            [OrderStatus.ON_HOLD]: [OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED],
            [OrderStatus.RETURNED]: [OrderStatus.CANCELLED]
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    private async handleStatusChange(order: Order, newStatus: OrderStatus): Promise<void> {
        switch (newStatus) {
            case OrderStatus.SHIPPED:
                // Update expected delivery date if not set
                if (!order.expectedDeliveryDate) {
                    const deliveryDate = new Date();
                    deliveryDate.setDate(deliveryDate.getDate() + 3); // Default 3 days
                    await this.orderRepository.update(order.id!, { expectedDeliveryDate: deliveryDate });
                }
                break;
            case OrderStatus.DELIVERED:
                // Set actual delivery date
                await this.orderRepository.update(order.id!, { actualDeliveryDate: new Date() });
                break;
        }
    }

    private updateInstallmentPayments(paymentTerms: any, paymentAmount: number): any {
        if (paymentTerms.type !== PaymentTermsType.INSTALLMENTS || !paymentTerms.installments) {
            return paymentTerms;
        }

        let remainingPayment = paymentAmount;
        const updatedInstallments = paymentTerms.installments.map((installment: any) => {
            if (installment.status === 'PENDING' && remainingPayment > 0) {
                const paymentForThisInstallment = Math.min(remainingPayment, installment.amount);
                remainingPayment -= paymentForThisInstallment;
                
                return {
                    ...installment,
                    paidAmount: (installment.paidAmount || 0) + paymentForThisInstallment,
                    status: paymentForThisInstallment >= installment.amount ? 'PAID' : 'PENDING',
                    paidDate: paymentForThisInstallment >= installment.amount ? new Date() : installment.paidDate
                };
            }
            return installment;
        });

        return {
            ...paymentTerms,
            installments: updatedInstallments
        };
    }

    private async createRecurringOrderInstance(originalOrder: Order): Promise<void> {
        if (!originalOrder.recurringOrder?.enabled) return;

        const config = originalOrder.recurringOrder;
        
        // Calculate next order date
        const nextDate = new Date();
        switch (config.frequency) {
            case RecurringFrequency.DAILY:
                nextDate.setDate(nextDate.getDate() + config.interval);
                break;
            case RecurringFrequency.WEEKLY:
                nextDate.setDate(nextDate.getDate() + (config.interval * 7));
                break;
            case RecurringFrequency.MONTHLY:
                nextDate.setMonth(nextDate.getMonth() + config.interval);
                break;
            case RecurringFrequency.QUARTERLY:
                nextDate.setMonth(nextDate.getMonth() + (config.interval * 3));
                break;
            case RecurringFrequency.YEARLY:
                nextDate.setFullYear(nextDate.getFullYear() + config.interval);
                break;
        }

        // Create new order instance
        const newOrderData: Partial<Order> = {
            ...originalOrder,
            id: undefined,
            orderNumber: undefined, // Will be generated
            status: config.autoApprove ? OrderStatus.CONFIRMED : OrderStatus.DRAFT,
            orderDate: new Date(),
            paidAmount: 0,
            remainingAmount: originalOrder.totalAmount,
            paymentStatus: PaymentStatus.PENDING,
            statusHistory: []
        };

        await this.createOrder(newOrderData, originalOrder.userId);

        // Update recurring config
        const updatedConfig = {
            ...config,
            currentOccurrence: config.currentOccurrence + 1,
            nextOrderDate: nextDate
        };

        // Check if we've reached max occurrences or end date
        if (
            (config.maxOccurrences && updatedConfig.currentOccurrence >= config.maxOccurrences) ||
            (config.endDate && nextDate > config.endDate)
        ) {
            updatedConfig.enabled = false;
        }

        await this.orderRepository.update(originalOrder.id!, {
            recurringOrder: updatedConfig
        });
    }
}