import { IOrderRepository, OrderFilters, PaginationOptions, DateRange } from '../../domain/repositories/IOrderRepository';
import { Order, OrderTemplate, OrderMetrics, BulkOrderOperation, OrderStatus, PaymentStatus } from '../../domain/entities/Order';
import { OrderModel, OrderTemplateModel, BulkOrderOperationModel } from '../models/order.model';
import { Types } from 'mongoose';

export class OrderRepositoryImpl implements IOrderRepository {
    // Basic CRUD Operations
    async create(order: Partial<Order>): Promise<Order> {
        const newOrder = await OrderModel.create(order);
        return newOrder.toJSON() as unknown as Order;
    }

    async findById(id: string): Promise<Order | null> {
        const order = await OrderModel.findById(id)
            .populate('customerId', 'name email phone')
            .populate('userId', 'name email')
            .populate('tenantId', 'name');
        return order ? (order.toJSON() as unknown as Order) : null;
    }

    async findByOrderNumber(orderNumber: string, tenantId: string): Promise<Order | null> {
        const order = await OrderModel.findOne({ orderNumber, tenantId })
            .populate('customerId', 'name email phone')
            .populate('userId', 'name email');
        return order ? (order.toJSON() as unknown as Order) : null;
    }

    async update(id: string, data: Partial<Order>): Promise<Order | null> {
        const order = await OrderModel.findByIdAndUpdate(id, data, { new: true })
            .populate('customerId', 'name email phone')
            .populate('userId', 'name email');
        return order ? (order.toJSON() as unknown as Order) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await OrderModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    // Query Operations
    async findByTenantId(
        tenantId: string, 
        filters?: OrderFilters, 
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }> {
        const query = this.buildFilterQuery(tenantId, filters);
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {};
        
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [orders, total] = await Promise.all([
            OrderModel.find(query)
                .populate('customerId', 'name email phone')
                .populate('userId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            OrderModel.countDocuments(query)
        ]);

        return {
            orders: orders.map(order => order.toJSON() as unknown as Order),
            total
        };
    }

    async findByCustomerId(
        customerId: string, 
        tenantId: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }> {
        const query = { customerId, tenantId };
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {};
        
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [orders, total] = await Promise.all([
            OrderModel.find(query)
                .populate('userId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            OrderModel.countDocuments(query)
        ]);

        return {
            orders: orders.map(order => order.toJSON() as unknown as Order),
            total
        };
    }

    async findByStatus(
        status: OrderStatus[], 
        tenantId: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }> {
        const query = { status: { $in: status }, tenantId };
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {};
        
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [orders, total] = await Promise.all([
            OrderModel.find(query)
                .populate('customerId', 'name email phone')
                .populate('userId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            OrderModel.countDocuments(query)
        ]);

        return {
            orders: orders.map(order => order.toJSON() as unknown as Order),
            total
        };
    }

    async findByPaymentStatus(
        paymentStatus: PaymentStatus[], 
        tenantId: string,
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }> {
        const query = { paymentStatus: { $in: paymentStatus }, tenantId };
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {};
        
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [orders, total] = await Promise.all([
            OrderModel.find(query)
                .populate('customerId', 'name email phone')
                .populate('userId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            OrderModel.countDocuments(query)
        ]);

        return {
            orders: orders.map(order => order.toJSON() as unknown as Order),
            total
        };
    }

    // Advanced Queries
    async findOverdueOrders(tenantId: string): Promise<Order[]> {
        const now = new Date();
        const orders = await OrderModel.find({
            tenantId,
            dueDate: { $lt: now },
            paymentStatus: { $in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
            status: { $nin: [OrderStatus.CANCELLED, OrderStatus.COMPLETED] }
        })
        .populate('customerId', 'name email phone')
        .populate('userId', 'name email')
        .sort({ dueDate: 1 });

        return orders.map(order => order.toJSON() as unknown as Order);
    }

    async findOrdersDueToday(tenantId: string): Promise<Order[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const orders = await OrderModel.find({
            tenantId,
            dueDate: { $gte: today, $lt: tomorrow },
            paymentStatus: { $in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
            status: { $nin: [OrderStatus.CANCELLED, OrderStatus.COMPLETED] }
        })
        .populate('customerId', 'name email phone')
        .populate('userId', 'name email')
        .sort({ dueDate: 1 });

        return orders.map(order => order.toJSON() as unknown as Order);
    }

    async findPendingApprovalOrders(tenantId: string): Promise<Order[]> {
        const orders = await OrderModel.find({
            tenantId,
            status: OrderStatus.PENDING_APPROVAL,
            'approvalWorkflow.status': 'PENDING'
        })
        .populate('customerId', 'name email phone')
        .populate('userId', 'name email')
        .sort({ createdAt: 1 });

        return orders.map(order => order.toJSON() as unknown as Order);
    }

    async findRecurringOrdersDue(): Promise<Order[]> {
        const now = new Date();
        const orders = await OrderModel.find({
            'recurringOrder.enabled': true,
            'recurringOrder.nextOrderDate': { $lte: now },
            status: { $nin: [OrderStatus.CANCELLED] }
        })
        .populate('customerId', 'name email phone')
        .populate('userId', 'name email')
        .populate('tenantId', 'name');

        return orders.map(order => order.toJSON() as unknown as Order);
    }

    // Search
    async searchOrders(
        tenantId: string, 
        searchTerm: string, 
        pagination?: PaginationOptions
    ): Promise<{ orders: Order[]; total: number }> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {};
        
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const searchQuery = {
            tenantId,
            $text: { $search: searchTerm }
        };

        const [orders, total] = await Promise.all([
            OrderModel.find(searchQuery)
                .populate('customerId', 'name email phone')
                .populate('userId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            OrderModel.countDocuments(searchQuery)
        ]);

        return {
            orders: orders.map(order => order.toJSON() as unknown as Order),
            total
        };
    }

    // Analytics
    async getOrderMetrics(tenantId: string, dateRange?: DateRange): Promise<OrderMetrics> {
        const matchStage: any = { tenantId: new Types.ObjectId(tenantId) };
        
        if (dateRange) {
            matchStage.createdAt = {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            };
        }

        const [
            totalStats,
            statusStats,
            paymentStats,
            topCustomers,
            deliveryStats
        ] = await Promise.all([
            // Total orders and value
            OrderModel.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalValue: { $sum: '$totalAmount' },
                        averageOrderValue: { $avg: '$totalAmount' },
                        pendingOrders: {
                            $sum: {
                                $cond: [{ $eq: ['$status', OrderStatus.PENDING_APPROVAL] }, 1, 0]
                            }
                        },
                        overduePayments: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $lt: ['$dueDate', new Date()] },
                                            { $in: ['$paymentStatus', [PaymentStatus.PENDING, PaymentStatus.PARTIAL]] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),
            
            // Orders by status
            OrderModel.aggregate([
                { $match: matchStage },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            
            // Payments by status
            OrderModel.aggregate([
                { $match: matchStage },
                { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
            ]),
            
            // Top customers
            OrderModel.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$customerId',
                        totalOrders: { $sum: 1 },
                        totalValue: { $sum: '$totalAmount' },
                        averageOrderValue: { $avg: '$totalAmount' },
                        lastOrderDate: { $max: '$createdAt' }
                    }
                },
                { $sort: { totalValue: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'customers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                { $unwind: '$customer' },
                {
                    $project: {
                        customerId: '$_id',
                        customerName: '$customer.name',
                        totalOrders: 1,
                        totalValue: 1,
                        averageOrderValue: 1,
                        lastOrderDate: 1
                    }
                }
            ]),
            
            // Delivery performance
            OrderModel.aggregate([
                {
                    $match: {
                        ...matchStage,
                        actualDeliveryDate: { $exists: true },
                        expectedDeliveryDate: { $exists: true }
                    }
                },
                {
                    $project: {
                        deliveryTime: {
                            $divide: [
                                { $subtract: ['$actualDeliveryDate', '$expectedDeliveryDate'] },
                                1000 * 60 * 60 * 24 // Convert to days
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageDeliveryTime: { $avg: '$deliveryTime' },
                        onTimeDeliveries: {
                            $sum: { $cond: [{ $lte: ['$deliveryTime', 0] }, 1, 0] }
                        },
                        totalDeliveries: { $sum: 1 }
                    }
                }
            ])
        ]);

        const baseStats = totalStats[0] || {
            totalOrders: 0,
            totalValue: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            overduePayments: 0
        };

        const ordersByStatus: Record<OrderStatus, number> = {} as any;
        Object.values(OrderStatus).forEach(status => {
            ordersByStatus[status] = 0;
        });
        statusStats.forEach((stat: any) => {
            if (stat._id && Object.values(OrderStatus).includes(stat._id)) {
                ordersByStatus[stat._id as OrderStatus] = stat.count;
            }
        });

        const paymentsByStatus: Record<PaymentStatus, number> = {} as any;
        Object.values(PaymentStatus).forEach(status => {
            paymentsByStatus[status] = 0;
        });
        paymentStats.forEach((stat: any) => {
            if (stat._id && Object.values(PaymentStatus).includes(stat._id)) {
                paymentsByStatus[stat._id as PaymentStatus] = stat.count;
            }
        });

        const deliveryData = deliveryStats[0] || { averageDeliveryTime: 0, onTimeDeliveries: 0, totalDeliveries: 0 };
        const completionRate = deliveryData.totalDeliveries > 0 
            ? (deliveryData.onTimeDeliveries / deliveryData.totalDeliveries) * 100 
            : 0;

        return {
            ...baseStats,
            completionRate,
            averageDeliveryTime: Math.abs(deliveryData.averageDeliveryTime || 0),
            topCustomers,
            ordersByStatus,
            paymentsByStatus
        };
    }

    async getCustomerOrderSummary(customerId: string, tenantId: string): Promise<any> {
        const summary = await OrderModel.aggregate([
            { $match: { customerId: new Types.ObjectId(customerId), tenantId: new Types.ObjectId(tenantId) } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalValue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' },
                    lastOrderDate: { $max: '$createdAt' },
                    pendingPayments: {
                        $sum: {
                            $cond: [
                                { $in: ['$paymentStatus', [PaymentStatus.PENDING, PaymentStatus.PARTIAL]] },
                                '$remainingAmount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return summary[0] || {
            totalOrders: 0,
            totalValue: 0,
            averageOrderValue: 0,
            lastOrderDate: null,
            pendingPayments: 0
        };
    }

    // Order Templates
    async createTemplate(template: Partial<OrderTemplate>): Promise<OrderTemplate> {
        const newTemplate = await OrderTemplateModel.create(template);
        return newTemplate.toJSON() as unknown as OrderTemplate;
    }

    async findTemplatesByTenantId(tenantId: string): Promise<OrderTemplate[]> {
        const templates = await OrderTemplateModel.find({ tenantId, isActive: true })
            .populate('customerId', 'name')
            .populate('createdBy', 'name')
            .sort({ name: 1 });
        
        return templates.map(template => template.toJSON() as unknown as OrderTemplate);
    }

    async updateTemplate(id: string, data: Partial<OrderTemplate>): Promise<OrderTemplate | null> {
        const template = await OrderTemplateModel.findByIdAndUpdate(id, data, { new: true })
            .populate('customerId', 'name')
            .populate('createdBy', 'name');
        
        return template ? (template.toJSON() as unknown as OrderTemplate) : null;
    }

    async deleteTemplate(id: string): Promise<boolean> {
        const result = await OrderTemplateModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    // Bulk Operations
    async createBulkOperation(operation: Partial<BulkOrderOperation>): Promise<BulkOrderOperation> {
        // Map domain entity to database model
        const dbOperation: any = { ...operation };
        if (operation.errors) {
            dbOperation.operationErrors = operation.errors;
            delete dbOperation.errors;
        }
        
        const newOperation = await BulkOrderOperationModel.create(dbOperation);
        const result = (newOperation as any).toObject();
        
        // Transform back to domain entity
        return {
            ...result,
            id: result._id.toString(),
            createdBy: result.createdBy.toString(),
            errors: result.operationErrors || [],
            createdAt: (result as any).createdAt,
            updatedAt: (result as any).updatedAt
        } as unknown as BulkOrderOperation;
    }

    async updateBulkOperation(id: string, data: Partial<BulkOrderOperation>): Promise<BulkOrderOperation | null> {
        // Map domain entity to database model
        const dbData: any = { ...data };
        if (data.errors) {
            dbData.operationErrors = data.errors;
            delete dbData.errors;
        }
        
        const operation = await BulkOrderOperationModel.findByIdAndUpdate(id, dbData, { new: true });
        if (!operation) return null;
        
        const result = (operation as any).toObject();
        
        // Transform back to domain entity
        return {
            ...result,
            id: result._id.toString(),
            createdBy: result.createdBy.toString(),
            errors: result.operationErrors || [],
            createdAt: (result as any).createdAt,
            updatedAt: (result as any).updatedAt
        } as unknown as BulkOrderOperation;
    }

    async findBulkOperationsByTenantId(tenantId: string): Promise<BulkOrderOperation[]> {
        const operations = await BulkOrderOperationModel.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(50);
        
        return operations.map(op => {
            const result = (op as any).toObject();
            return {
                ...result,
                id: result._id.toString(),
                createdBy: result.createdBy.toString(),
                errors: result.operationErrors || [],
                createdAt: (result as any).createdAt,
                updatedAt: (result as any).updatedAt
            } as unknown as BulkOrderOperation;
        });
    }

    // Helper method to build filter query
    private buildFilterQuery(tenantId: string, filters?: OrderFilters): any {
        const query: any = { tenantId };

        if (!filters) return query;

        if (filters.status && filters.status.length > 0) {
            query.status = { $in: filters.status };
        }

        if (filters.paymentStatus && filters.paymentStatus.length > 0) {
            query.paymentStatus = { $in: filters.paymentStatus };
        }

        if (filters.customerId) {
            query.customerId = filters.customerId;
        }

        if (filters.userId) {
            query.userId = filters.userId;
        }

        if (filters.priority && filters.priority.length > 0) {
            query.priority = { $in: filters.priority };
        }

        if (filters.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }

        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
            if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
        }

        if (filters.dueDateFrom || filters.dueDateTo) {
            query.dueDate = {};
            if (filters.dueDateFrom) query.dueDate.$gte = filters.dueDateFrom;
            if (filters.dueDateTo) query.dueDate.$lte = filters.dueDateTo;
        }

        if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
            query.totalAmount = {};
            if (filters.minAmount !== undefined) query.totalAmount.$gte = filters.minAmount;
            if (filters.maxAmount !== undefined) query.totalAmount.$lte = filters.maxAmount;
        }

        if (filters.hasApprovalWorkflow !== undefined) {
            query['approvalWorkflow.required'] = filters.hasApprovalWorkflow;
        }

        if (filters.isRecurring !== undefined) {
            query['recurringOrder.enabled'] = filters.isRecurring;
        }

        return query;
    }
}