import { ISalesRepository } from '../domain/sales.repository';
import { IProductRepository } from '../../products/domain/product.repository';
import { IInventoryRepository } from '../../inventory/domain/IInventoryRepository';
import { StockMovementType } from '../../inventory/domain/StockMovementType';
import { ICustomerRepository } from '../../customers/domain/ICustomerRepository';
import { CreateSaleDto } from '../interfaces/sales.dto';
import { BadRequestError, NotFoundError } from '../../../core/errors/app-error';

export class ProcessSaleUseCase {
    constructor(
        private salesRepository: ISalesRepository,
        private productRepository: IProductRepository,
        private inventoryRepository: IInventoryRepository,
        private customerRepository: ICustomerRepository
    ) { }

    async execute(tenantId: string, userId: string, dto: CreateSaleDto) {
        // Validate customer if provided
        if (dto.customerId) {
            const customer = await this.customerRepository.findById(dto.customerId, tenantId);
            if (!customer) {
                throw new NotFoundError('Customer not found');
            }
        }

        const saleItems = [];
        let totalAmount = 0;

        // Validate products and calculate totals
        for (const item of dto.items) {
            const product = await this.productRepository.findById(item.productId, tenantId);
            if (!product) {
                throw new NotFoundError(`Product not found: ${item.productId}`);
            }

            // Stock check
            if (product.stockQuantity < item.quantity) {
                throw new BadRequestError(`Insufficient stock for product: ${product.name}`);
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            saleItems.push({
                productId: product._id as any,
                name: product.name,
                price: product.price,
                buyingPrice: product.buyingPrice || 0,
                quantity: item.quantity,
                subtotal,
            });
        }

        // Create sale
        const sale = await this.salesRepository.create({
            items: saleItems,
            totalAmount,
            paymentMethod: dto.paymentMethod,
            tenantId: tenantId as any,
            userId: userId as any,
            customerId: dto.customerId ? (dto.customerId as any) : undefined,
        });

        // Update stock and record movements
        for (const item of saleItems) {
            // Deduct stock
            await this.productRepository.updateStock(item.productId.toString(), tenantId, -item.quantity);

            // Record stock movement
            await this.inventoryRepository.recordMovement({
                productId: item.productId as any,
                tenantId: tenantId as any,
                type: StockMovementType.SALE,
                quantity: item.quantity,
                reason: `Sale ${sale._id}`,
                referenceId: (sale._id as any).toString(),
            });
        }

        return sale;
    }
}
