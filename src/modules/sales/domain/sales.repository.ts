import { ISale } from '../infrastructure/sale.model';
import { ClientSession } from 'mongoose';

export interface ISalesRepository {
    create(saleData: Partial<ISale>, session?: ClientSession): Promise<ISale>;
    findAll(tenantId: string, options?: { page?: number; limit?: number }): Promise<{ sales: ISale[]; total: number }>;
    findById(id: string, tenantId: string): Promise<ISale | null>;
}
