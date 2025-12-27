import { Request, Response, NextFunction } from 'express';
import { RecordStockMovementUseCase } from '../../../application/RecordStockMovementUseCase';
import { IInventoryRepository } from '../../../domain/IInventoryRepository';
import { StockMovementType } from '../../../domain/StockMovementType';

export class InventoryController {
    constructor(
        private recordMovementUseCase: RecordStockMovementUseCase,
        private inventoryRepository: IInventoryRepository
    ) { }

    adjustStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { productId, quantity, reason, type } = req.body;

            const result = await this.recordMovementUseCase.execute(tenantId, {
                productId,
                quantity,
                reason,
                type: type || StockMovementType.ADJUSTMENT,
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { productId } = req.params;
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const { movements, total } = await this.inventoryRepository.getProductHistory(productId, tenantId, { page, limit });

            const currentPage = page || 1;
            const pageLimit = limit || 10;

            res.json({
                data: movements,
                pagination: {
                    page: currentPage,
                    limit: pageLimit,
                    total,
                    totalPages: Math.ceil(total / pageLimit)
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
