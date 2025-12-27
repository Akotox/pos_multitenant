import { IInventoryRepository } from '../../../domain/IInventoryRepository';
import { IStockMovement, StockMovementModel } from '../models/StockMovementModel';

export class InventoryRepositoryImpl implements IInventoryRepository {
    async recordMovement(movement: Partial<IStockMovement>, session?: any): Promise<IStockMovement> {
        const result = await StockMovementModel.create([movement], { session });
        return result[0];
    }

    async getProductHistory(productId: string, tenantId: string, options?: { page?: number; limit?: number }): Promise<{ movements: IStockMovement[]; total: number }> {
        const { page = 1, limit = 10 } = options || {};
        const skip = (page - 1) * limit;

        const [movements, total] = await Promise.all([
            StockMovementModel.find({ productId, tenantId })
                .populate('productId', 'name sku barcode')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            StockMovementModel.countDocuments({ productId, tenantId })
        ]);

        return { movements, total };
    }
}
