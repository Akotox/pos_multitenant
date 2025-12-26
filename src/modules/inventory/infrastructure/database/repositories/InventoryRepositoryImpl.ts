import { IInventoryRepository } from '../../../domain/IInventoryRepository';
import { IStockMovement, StockMovementModel } from '../models/StockMovementModel';

export class InventoryRepositoryImpl implements IInventoryRepository {
    async recordMovement(movement: Partial<IStockMovement>, session?: any): Promise<IStockMovement> {
        const result = await StockMovementModel.create([movement], { session });
        return result[0];
    }

    async getProductHistory(productId: string, tenantId: string): Promise<IStockMovement[]> {
        return await StockMovementModel.find({ productId, tenantId }).sort({ createdAt: -1 });
    }
}
