import { IProductRepository } from '../domain/product.repository';
import { CreateProductDto, UpdateProductDto } from '../interfaces/product.dto';
import { NotFoundError } from '../../../core/errors/app-error';
import { IInventoryRepository } from '../../inventory/domain/IInventoryRepository';
import { StockMovementType } from '../../inventory/domain/StockMovementType';

export class ProductUseCases {
    constructor(
        private productRepository: IProductRepository,
        private inventoryRepository: IInventoryRepository
    ) { }

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

    async getAll(tenantId: string, page?: number, limit?: number) {
        const { products, total } = await this.productRepository.findAll(tenantId, { page, limit });
        const currentPage = page || 1;
        const pageLimit = limit || 10;

        return {
            data: products,
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(total / pageLimit)
            }
        };
    }

    async getById(tenantId: string, id: string) {
        const product = await this.productRepository.findById(id, tenantId);
        if (!product) throw new NotFoundError('Product not found');
        return product;
    }

    async update(tenantId: string, id: string, dto: UpdateProductDto) {
        // Check if stock quantity is being updated
        if (dto.stockQuantity !== undefined) {
            // Get current product to calculate difference
            const currentProduct = await this.productRepository.findById(id, tenantId);
            if (!currentProduct) throw new NotFoundError('Product not found');

            const quantityDifference = dto.stockQuantity - currentProduct.stockQuantity;

            // Update the product
            const updatedProduct = await this.productRepository.update(id, tenantId, dto as any);
            if (!updatedProduct) throw new NotFoundError('Product not found');

            // Record inventory movement if there's a change
            if (quantityDifference !== 0) {
                await this.inventoryRepository.recordMovement({
                    productId: updatedProduct._id as any,
                    tenantId: tenantId as any,
                    type: StockMovementType.ADJUSTMENT,
                    quantity: Math.abs(quantityDifference),
                    reason: `Manual stock adjustment via product update (${quantityDifference > 0 ? '+' : ''}${quantityDifference})`,
                });
            }

            return updatedProduct;
        }

        // Normal update without stock change
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
