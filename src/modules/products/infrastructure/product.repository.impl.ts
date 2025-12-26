import { IProductRepository } from '../domain/product.repository';
import { IProduct, ProductModel } from './product.model';

export class ProductRepository implements IProductRepository {
    async create(productData: Partial<IProduct>): Promise<IProduct> {
        return await ProductModel.create(productData);
    }

    async findAll(tenantId: string): Promise<IProduct[]> {
        return await ProductModel.find({ tenantId, isActive: true }).populate('categoryId', 'name');
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
