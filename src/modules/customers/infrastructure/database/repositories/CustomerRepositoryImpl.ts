import { ICustomerRepository } from '../../../domain/ICustomerRepository';
import { CustomerModel, ICustomer } from '../models/CustomerModel';
import { ConflictError } from '../../../../../core/errors/app-error';

export class CustomerRepositoryImpl implements ICustomerRepository {
    async create(customer: Partial<ICustomer>): Promise<ICustomer> {
        try {
            return await CustomerModel.create(customer);
        } catch (error: any) {
            if (error.code === 11000) {
                const field = error.keyPattern?.email ? 'email' : 'phone';
                throw new ConflictError(`Customer with this ${field} already exists`);
            }
            throw error;
        }
    }

    async update(id: string, tenantId: string, data: Partial<ICustomer>): Promise<ICustomer | null> {
        try {
            return await CustomerModel.findOneAndUpdate({ _id: id, tenantId }, data, { new: true });
        } catch (error: any) {
            if (error.code === 11000) {
                const field = error.keyPattern?.email ? 'email' : 'phone';
                throw new ConflictError(`Customer with this ${field} already exists`);
            }
            throw error;
        }
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
