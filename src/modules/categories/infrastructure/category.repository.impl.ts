import { ICategoryRepository } from '../domain/category.repository';
import { ICategory, CategoryModel } from './category.model';
import { ConflictError } from '../../../core/errors/app-error';

export class CategoryRepository implements ICategoryRepository {
    async create(categoryData: Partial<ICategory>): Promise<ICategory> {
        try {
            return await CategoryModel.create(categoryData);
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictError('Category with this name already exists');
            }
            throw error;
        }
    }

    async findAll(tenantId: string, options?: { page?: number; limit?: number }): Promise<{ categories: ICategory[]; total: number }> {
        const { page = 1, limit = 10 } = options || {};
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            CategoryModel.find({ tenantId, isActive: true })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            CategoryModel.countDocuments({ tenantId, isActive: true })
        ]);

        return { categories, total };
    }

    async findById(id: string, tenantId: string): Promise<ICategory | null> {
        return await CategoryModel.findOne({ _id: id, tenantId });
    }

    async update(id: string, tenantId: string, categoryData: Partial<ICategory>): Promise<ICategory | null> {
        try {
            return await CategoryModel.findOneAndUpdate(
                { _id: id, tenantId },
                { $set: categoryData },
                { new: true }
            );
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictError('Category with this name already exists');
            }
            throw error;
        }
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await CategoryModel.updateOne(
            { _id: id, tenantId },
            { $set: { isActive: false } }
        );
        return result.modifiedCount > 0;
    }
}
