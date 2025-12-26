import { ICustomerRepository } from '../../../domain/ICustomerRepository';
import { CustomerModel, ICustomer } from '../models/CustomerModel';

export class CustomerRepositoryImpl implements ICustomerRepository {
    async create(customer: Partial<ICustomer>): Promise<ICustomer> {
        return await CustomerModel.create(customer);
    }

    async update(id: string, tenantId: string, data: Partial<ICustomer>): Promise<ICustomer | null> {
        return await CustomerModel.findOneAndUpdate({ _id: id, tenantId }, data, { new: true });
    }

    async findById(id: string, tenantId: string): Promise<ICustomer | null> {
        return await CustomerModel.findOne({ _id: id, tenantId });
    }

    async findAll(tenantId: string, options?: { search?: string; page?: number; limit?: number }): Promise<{ customers: ICustomer[]; total: number }> {
        const { search, page = 1, limit = 10 } = options || {};
        const query: any = { tenantId };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [customers, total] = await Promise.all([
            CustomerModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            CustomerModel.countDocuments(query),
        ]);

        return { customers, total };
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await CustomerModel.deleteOne({ _id: id, tenantId });
        return result.deletedCount > 0;
    }
}
