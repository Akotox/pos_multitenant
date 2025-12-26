import { ICategoryRepository } from '../domain/category.repository';
import { ICategory, CategoryModel } from './category.model';

export class CategoryRepository implements ICategoryRepository {
    async create(categoryData: Partial<ICategory>): Promise<ICategory> {
        return await CategoryModel.create(categoryData);
    }

    async findAll(tenantId: string): Promise<ICategory[]> {
        return await CategoryModel.find({ tenantId, isActive: true });
    }

    async findById(id: string, tenantId: string): Promise<ICategory | null> {
        return await CategoryModel.findOne({ _id: id, tenantId });
    }

    async update(id: string, tenantId: string, categoryData: Partial<ICategory>): Promise<ICategory | null> {
        return await CategoryModel.findOneAndUpdate(
            { _id: id, tenantId },
            { $set: categoryData },
            { new: true }
        );
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await CategoryModel.updateOne(
            { _id: id, tenantId },
            { $set: { isActive: false } }
        );
        return result.modifiedCount > 0;
    }
}
