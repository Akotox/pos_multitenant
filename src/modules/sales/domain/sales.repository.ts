import { ISale } from '../infrastructure/sale.model';
import { ClientSession } from 'mongoose';

export interface ISalesRepository {
    create(saleData: Partial<ISale>, session?: ClientSession): Promise<ISale>;
    findAll(tenantId: string): Promise<ISale[]>;
    findById(id: string, tenantId: string): Promise<ISale | null>;
}
