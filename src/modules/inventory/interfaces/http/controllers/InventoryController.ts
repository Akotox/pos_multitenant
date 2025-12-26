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

            const result = await this.inventoryRepository.getProductHistory(productId, tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
