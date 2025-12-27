import { ISalesRepository } from '../domain/sales.repository';
import { ISale, SaleModel } from './sale.model';
import { ClientSession } from 'mongoose';

export class SalesRepository implements ISalesRepository {
    async create(saleData: Partial<ISale>, session?: ClientSession): Promise<ISale> {
        const sale = new SaleModel(saleData);
        return await sale.save({ session });
    }

    async findAll(tenantId: string, options?: { page?: number; limit?: number }): Promise<{ sales: ISale[]; total: number }> {
        const { page = 1, limit = 10 } = options || {};
        const skip = (page - 1) * limit;

        const [sales, total] = await Promise.all([
            SaleModel.find({ tenantId })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            SaleModel.countDocuments({ tenantId })
        ]);

        return { sales, total };
    }

    async findById(id: string, tenantId: string): Promise<ISale | null> {
        return await SaleModel.findOne({ _id: id, tenantId });
    }
}
