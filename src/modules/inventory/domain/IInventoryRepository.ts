import { IStockMovement } from '../infrastructure/database/models/StockMovementModel';

export interface IInventoryRepository {
    recordMovement(movement: Partial<IStockMovement>, session?: any): Promise<IStockMovement>;
    getProductHistory(productId: string, tenantId: string, options?: { page?: number; limit?: number }): Promise<{ movements: IStockMovement[]; total: number }>;
}
