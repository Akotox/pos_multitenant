import { SaleModel } from '../../sales/infrastructure/sale.model';
import { ProductModel } from '../../products/infrastructure/product.model';
import { Types } from 'mongoose';

export class ReportsUseCases {
    async getDailySalesReport(tenantId: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await SaleModel.aggregate([
            {
                $match: {
                    tenantId: new Types.ObjectId(tenantId),
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 },
                },
            },
        ]);

        return sales.length > 0 ? sales[0] : { totalSales: 0, orderCount: 0 };
    }

    async getSalesByProduct(tenantId: string) {
        return await SaleModel.aggregate([
            {
                $match: {
                    tenantId: new Types.ObjectId(tenantId),
                },
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.name' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' },
                },
            },
            { $sort: { totalRevenue: -1 } },
        ]);
    }

    async getProfitStats(tenantId: string, startDate?: Date, endDate?: Date) {
        const matchStage: any = { tenantId: new Types.ObjectId(tenantId) };
        if (startDate && endDate) {
            matchStage.createdAt = { $gte: startDate, $lte: endDate };
        }

        const stats = await SaleModel.aggregate([
            { $match: matchStage },
            { $unwind: '$items' },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$items.subtotal' },
                    totalCost: { $sum: { $multiply: ['$items.quantity', '$items.buyingPrice'] } },
                    totalItemsSold: { $sum: '$items.quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalCost: 1,
                    grossProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
                    profitMargin: {
                        $cond: [
                            { $eq: ['$totalRevenue', 0] },
                            0,
                            { $multiply: [{ $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] }, 100] }
                        ]
                    }
                }
            }
        ]);

        return stats.length > 0 ? stats[0] : { totalRevenue: 0, totalCost: 0, grossProfit: 0, profitMargin: 0 };
    }

    async getCustomerInsights(tenantId: string) {
        const topCustomers = await SaleModel.aggregate([
            { $match: { tenantId: new Types.ObjectId(tenantId), customerId: { $exists: true } } },
            {
                $group: {
                    _id: '$customerId',
                    totalSpend: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 },
                    lastPurchase: { $max: '$createdAt' }
                }
            },
            { $sort: { totalSpend: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerDetails'
                }
            },
            { $unwind: '$customerDetails' },
            {
                $project: {
                    name: '$customerDetails.name',
                    email: '$customerDetails.email',
                    totalSpend: 1,
                    orderCount: 1,
                    lastPurchase: 1
                }
            }
        ]);

        return topCustomers;
    }

    async getStockAlerts(tenantId: string) {
        // Low Stock
        const lowStock = await ProductModel.find({
            tenantId,
            stockQuantity: { $lte: 10 }, // Threshold should ideally be configurable
            isActive: true
        }).select('name sku stockQuantity').limit(10);

        return { lowStock };
    }

    async getSalesHeatmap(tenantId: string) {
        const heatmap = await SaleModel.aggregate([
            { $match: { tenantId: new Types.ObjectId(tenantId) } },
            {
                $project: {
                    hour: { $hour: '$createdAt' },
                    dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1 (Sun) - 7 (Sat)
                    amount: '$totalAmount'
                }
            },
            {
                $group: {
                    _id: { hour: '$hour', day: '$dayOfWeek' },
                    totalSales: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.day': 1, '_id.hour': 1 } }
        ]);
        return heatmap;
    }
}
