import { IProductRepository } from '../domain/product.repository';
import { CreateProductDto, UpdateProductDto } from '../interfaces/product.dto';
import { NotFoundError } from '../../../core/errors/app-error';

export class ProductUseCases {
    constructor(private productRepository: IProductRepository) { }

    async create(tenantId: string, dto: CreateProductDto) {
        const sku = await this.generateSku();
        return await this.productRepository.create({
            ...(dto as any),
            sku,
            tenantId: tenantId as any,
        });
    }

    private async generateSku(): Promise<string> {
        // Simple SKU generation: PRD + Timestamp + Random String
        const timestamp = Date.now().toString().slice(-6);
        const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `PRD-${timestamp}-${randomStr}`;
    }

    async getAll(tenantId: string) {
        return await this.productRepository.findAll(tenantId);
    }

    async getById(tenantId: string, id: string) {
        const product = await this.productRepository.findById(id, tenantId);
        if (!product) throw new NotFoundError('Product not found');
        return product;
    }

    async update(tenantId: string, id: string, dto: UpdateProductDto) {
        const product = await this.productRepository.update(id, tenantId, dto as any);
        if (!product) throw new NotFoundError('Product not found');
        return product;
    }

    async delete(tenantId: string, id: string) {
        const success = await this.productRepository.delete(id, tenantId);
        if (!success) throw new NotFoundError('Product not found');
        return { message: 'Product deleted successfully' };
    }
}
