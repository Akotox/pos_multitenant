import { IProduct } from '../infrastructure/product.model';

export interface IProductRepository {
    create(productData: Partial<IProduct>): Promise<IProduct>;
    findAll(tenantId: string, options?: { page?: number; limit?: number }): Promise<{ products: IProduct[]; total: number }>;
    findById(id: string, tenantId: string): Promise<IProduct | null>;
    update(id: string, tenantId: string, productData: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    updateStock(id: string, tenantId: string, quantity: number, session?: any): Promise<IProduct | null>;
}
