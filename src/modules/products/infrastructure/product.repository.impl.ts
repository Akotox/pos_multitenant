import { IProductRepository } from '../domain/product.repository';
import { IProduct, ProductModel } from './product.model';

export class ProductRepository implements IProductRepository {
    async create(productData: Partial<IProduct>): Promise<IProduct> {
        return await ProductModel.create(productData);
    }

    async findAll(tenantId: string, options?: { page?: number; limit?: number }): Promise<{ products: IProduct[]; total: number }> {
        const { page = 1, limit = 10 } = options || {};
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            ProductModel.find({ tenantId, isActive: true })
                .populate('categoryId', 'name')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            ProductModel.countDocuments({ tenantId, isActive: true })
        ]);

        return { products, total };
    }

    async findById(id: string, tenantId: string): Promise<IProduct | null> {
        return await ProductModel.findOne({ _id: id, tenantId }).populate('categoryId', 'name');
    }

    async update(id: string, tenantId: string, productData: Partial<IProduct>): Promise<IProduct | null> {
        return await ProductModel.findOneAndUpdate(
            { _id: id, tenantId },
            { $set: productData },
            { new: true }
        );
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await ProductModel.updateOne(
            { _id: id, tenantId },
            { $set: { isActive: false } }
        );
        return result.modifiedCount > 0;
    }

    async updateStock(id: string, tenantId: string, quantity: number, session?: any): Promise<IProduct | null> {
        return await ProductModel.findOneAndUpdate(
            { _id: id, tenantId },
            { $inc: { stockQuantity: quantity } },
            { new: true, session }
        );
    }
}
