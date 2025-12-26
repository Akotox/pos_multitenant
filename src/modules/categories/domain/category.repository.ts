import { ICategory } from '../infrastructure/category.model';

export interface ICategoryRepository {
    create(categoryData: Partial<ICategory>): Promise<ICategory>;
    findAll(tenantId: string): Promise<ICategory[]>;
    findById(id: string, tenantId: string): Promise<ICategory | null>;
    update(id: string, tenantId: string, categoryData: Partial<ICategory>): Promise<ICategory | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
}
