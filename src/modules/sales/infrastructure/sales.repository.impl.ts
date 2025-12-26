import { ISalesRepository } from '../domain/sales.repository';
import { ISale, SaleModel } from './sale.model';
import { ClientSession } from 'mongoose';

export class SalesRepository implements ISalesRepository {
    async create(saleData: Partial<ISale>, session?: ClientSession): Promise<ISale> {
        const sale = new SaleModel(saleData);
        return await sale.save({ session });
    }

    async findAll(tenantId: string): Promise<ISale[]> {
        return await SaleModel.find({ tenantId }).sort({ createdAt: -1 });
    }

    async findById(id: string, tenantId: string): Promise<ISale | null> {
        return await SaleModel.findOne({ _id: id, tenantId });
    }
}
