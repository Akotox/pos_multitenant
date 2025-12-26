import { ICategoryRepository } from '../domain/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../interfaces/category.dto';
import { NotFoundError } from '../../../core/errors/app-error';

export class CategoryUseCases {
    constructor(private categoryRepository: ICategoryRepository) { }

    async create(tenantId: string, dto: CreateCategoryDto) {
        return await this.categoryRepository.create({ ...dto, tenantId: tenantId as any });
    }

    async getAll(tenantId: string) {
        return await this.categoryRepository.findAll(tenantId);
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
