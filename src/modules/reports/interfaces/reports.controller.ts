import { Request, Response, NextFunction } from 'express';
import { ReportsUseCases } from '../application/reports.usecases';

export class ReportsController {
    constructor(private reportsUseCases: ReportsUseCases) { }

    getDailySales = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.reportsUseCases.getDailySalesReport(tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getSalesByProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.reportsUseCases.getSalesByProduct(tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const dailySales = await this.reportsUseCases.getDailySalesReport(tenantId);
            const profitStats = await this.reportsUseCases.getProfitStats(tenantId);
            const lowStock = await this.reportsUseCases.getStockAlerts(tenantId);

            res.json({
                dailySales,
                profitStats,
                alerts: lowStock
            });
        } catch (error) {
            next(error);
        }
    };

    getAdvancedStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const customers = await this.reportsUseCases.getCustomerInsights(tenantId);
            const heatmap = await this.reportsUseCases.getSalesHeatmap(tenantId);

            res.json({
                topCustomers: customers,
                salesHeatmap: heatmap
            });
        } catch (error) {
            next(error);
        }
    };
}
