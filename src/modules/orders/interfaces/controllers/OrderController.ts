import { Request, Response, NextFunction } from 'express';
import { OrderUseCases } from '../../application/usecases/OrderUseCases';
import { OrderStatus, OrderPriority, PaymentStatus, BulkOperationType } from '../../domain/entities/Order';

export class OrderController {
    constructor(private orderUseCases: OrderUseCases) {}

    // Order CRUD Operations
    createOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const userId = req.user!.id;
            
            const orderData = {
                ...req.body,
                tenantId
            };

            const order = await this.orderUseCases.createOrder(orderData, userId);
            
            res.status(201).json({
                success: true,
                data: order,
                message: 'Order created successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getOrderById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const order = await this.orderUseCases.getOrderById(id);
            
            res.json({
                success: true,
                data: order,
                message: 'Order retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getOrderByNumber = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderNumber } = req.params;
            const tenantId = req.tenantId!;
            
            const order = await this.orderUseCases.getOrderByNumber(orderNumber, tenantId);
            
            res.json({
                success: true,
                data: order,
                message: 'Order retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                status,
                paymentStatus,
                customerId,
                priority,
                tags,
                dateFrom,
                dateTo,
                dueDateFrom,
                dueDateTo,
                minAmount,
                maxAmount,
                hasApprovalWorkflow,
                isRecurring
            } = req.query;

            const filters: any = {};
            if (status) filters.status = Array.isArray(status) ? status : [status];
            if (paymentStatus) filters.paymentStatus = Array.isArray(paymentStatus) ? paymentStatus : [paymentStatus];
            if (customerId) filters.customerId = customerId as string;
            if (priority) filters.priority = Array.isArray(priority) ? priority : [priority];
            if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
            if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
            if (dateTo) filters.dateTo = new Date(dateTo as string);
            if (dueDateFrom) filters.dueDateFrom = new Date(dueDateFrom as string);
            if (dueDateTo) filters.dueDateTo = new Date(dueDateTo as string);
            if (minAmount) filters.minAmount = parseFloat(minAmount as string);
            if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);
            if (hasApprovalWorkflow !== undefined) filters.hasApprovalWorkflow = hasApprovalWorkflow === 'true';
            if (isRecurring !== undefined) filters.isRecurring = isRecurring === 'true';

            const pagination = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: sortOrder as 'asc' | 'desc'
            };

            const result = await this.orderUseCases.getOrdersByTenant(tenantId, filters, pagination);
            
            res.json({
                success: true,
                data: result,
                message: 'Orders retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getOrdersByCustomer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { customerId } = req.params;
            const tenantId = req.tenantId!;
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

            const pagination = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: sortOrder as 'asc' | 'desc'
            };

            const result = await this.orderUseCases.getOrdersByCustomer(customerId, tenantId, pagination);
            
            res.json({
                success: true,
                data: result,
                message: 'Customer orders retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    searchOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { q: searchTerm, page = 1, limit = 10 } = req.query;

            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
            }

            const pagination = {
                page: parseInt(page as string),
                limit: parseInt(limit as string)
            };

            const result = await this.orderUseCases.searchOrders(tenantId, searchTerm as string, pagination);
            
            res.json({
                success: true,
                data: result,
                message: 'Orders search completed successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updateOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user!.id;
            
            const order = await this.orderUseCases.updateOrder(id, req.body, userId);
            
            res.json({
                success: true,
                data: order,
                message: 'Order updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status, reason, notes } = req.body;
            const userId = req.user!.id;
            
            const order = await this.orderUseCases.updateOrderStatus(id, status, userId, reason, notes);
            
            res.json({
                success: true,
                data: order,
                message: 'Order status updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            
            await this.orderUseCases.deleteOrder(id);
            
            res.json({
                success: true,
                message: 'Order deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Payment Management
    recordPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { amount, paymentMethod, notes } = req.body;
            const userId = req.user!.id;
            
            const order = await this.orderUseCases.recordPayment(id, amount, paymentMethod, userId, notes);
            
            res.json({
                success: true,
                data: order,
                message: 'Payment recorded successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Approval Workflow
    approveOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { comments } = req.body;
            const approverId = req.user!.id;
            
            const order = await this.orderUseCases.approveOrder(id, approverId, comments);
            
            res.json({
                success: true,
                data: order,
                message: 'Order approved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    rejectOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const approverId = req.user!.id;
            
            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }
            
            const order = await this.orderUseCases.rejectOrder(id, approverId, reason);
            
            res.json({
                success: true,
                data: order,
                message: 'Order rejected successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Templates
    createTemplate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const userId = req.user!.id;
            
            const templateData = {
                ...req.body,
                tenantId,
                createdBy: userId
            };

            const template = await this.orderUseCases.createTemplate(templateData);
            
            res.status(201).json({
                success: true,
                data: template,
                message: 'Order template created successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getTemplates = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            
            const templates = await this.orderUseCases.getTemplatesByTenant(tenantId);
            
            res.json({
                success: true,
                data: templates,
                message: 'Order templates retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    createOrderFromTemplate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { templateId } = req.params;
            const { customerId } = req.body;
            const userId = req.user!.id;
            
            const order = await this.orderUseCases.createOrderFromTemplate(templateId, customerId, userId);
            
            res.status(201).json({
                success: true,
                data: order,
                message: 'Order created from template successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Analytics & Reports
    getOrderMetrics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { startDate, endDate } = req.query;
            
            let dateRange;
            if (startDate && endDate) {
                dateRange = {
                    startDate: new Date(startDate as string),
                    endDate: new Date(endDate as string)
                };
            }
            
            const metrics = await this.orderUseCases.getOrderMetrics(tenantId, dateRange);
            
            res.json({
                success: true,
                data: metrics,
                message: 'Order metrics retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getOverdueOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            
            const orders = await this.orderUseCases.getOverdueOrders(tenantId);
            
            res.json({
                success: true,
                data: orders,
                message: 'Overdue orders retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getOrdersDueToday = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            
            const orders = await this.orderUseCases.getOrdersDueToday(tenantId);
            
            res.json({
                success: true,
                data: orders,
                message: 'Orders due today retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getPendingApprovalOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            
            const orders = await this.orderUseCases.getPendingApprovalOrders(tenantId);
            
            res.json({
                success: true,
                data: orders,
                message: 'Pending approval orders retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Bulk Operations
    createBulkOperation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type, orderIds, parameters } = req.body;
            const userId = req.user!.id;
            
            const operation = await this.orderUseCases.createBulkOperation(type, orderIds, parameters, userId);
            
            res.status(201).json({
                success: true,
                data: operation,
                message: 'Bulk operation created successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Recurring Orders
    processRecurringOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.orderUseCases.processRecurringOrders();
            
            res.json({
                success: true,
                message: 'Recurring orders processed successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}