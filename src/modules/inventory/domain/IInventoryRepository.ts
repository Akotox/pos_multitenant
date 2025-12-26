import { IStockMovement } from '../infrastructure/database/models/StockMovementModel';

export interface IInventoryRepository {
    recordMovement(movement: Partial<IStockMovement>, session?: any): Promise<IStockMovement>;
    getProductHistory(productId: string, tenantId: string): Promise<IStockMovement[]>;
}
