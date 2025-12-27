import { ICategoryRepository } from '../domain/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../interfaces/category.dto';
import { NotFoundError } from '../../../core/errors/app-error';

export class CategoryUseCases {
    constructor(private categoryRepository: ICategoryRepository) { }

    async create(tenantId: string, dto: CreateCategoryDto) {
        return await this.categoryRepository.create({ ...dto, tenantId: tenantId as any });
    }

    async getAll(tenantId: string, page?: number, limit?: number) {
        const { categories, total } = await this.categoryRepository.findAll(tenantId, { page, limit });
        const currentPage = page || 1;
        const pageLimit = limit || 10;

        return {
            data: categories,
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(total / pageLimit)
            }
        };
    }

    async getById(tenantId: string, id: string) {
        const category = await this.categoryRepository.findById(id, tenantId);
        if (!category) throw new NotFoundError('Category not found');
        return category;
    }

    async update(tenantId: string, id: string, dto: UpdateCategoryDto) {
        const category = await this.categoryRepository.update(id, tenantId, dto);
        if (!category) throw new NotFoundError('Category not found');
        return category;
    }

    async delete(tenantId: string, id: string) {
        const success = await this.categoryRepository.delete(id, tenantId);
        if (!success) throw new NotFoundError('Category not found');
        return { message: 'Category deleted successfully' };
    }
}
