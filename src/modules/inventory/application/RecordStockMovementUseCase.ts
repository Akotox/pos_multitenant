import { IInventoryRepository } from '../domain/IInventoryRepository';
import { IProductRepository } from '../../products/domain/product.repository';
import { StockMovementType } from '../domain/StockMovementType';
import { NotFoundError } from '../../../core/errors/app-error';

export interface RecordMovementDto {
    productId: string;
    type: StockMovementType;
    quantity: number;
    reason?: string;
    referenceId?: string;
}

export class RecordStockMovementUseCase {
    constructor(
        private inventoryRepository: IInventoryRepository,
        private productRepository: IProductRepository
    ) { }

    async execute(tenantId: string, dto: RecordMovementDto) {
        const product = await this.productRepository.findById(dto.productId, tenantId);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // 1. Record the movement log
        const movement = await this.inventoryRepository.recordMovement({
            productId: dto.productId as any,
            tenantId: tenantId as any,
            type: dto.type,
            quantity: dto.quantity,
            reason: dto.reason,
            referenceId: dto.referenceId,
        });

        // 2. Update the product stock quantity
        // Logic: IN/RETURN/ADJUSTMENT(+) = positive quantity change
        // OUT/SALE/ADJUSTMENT(-) = negative quantity change
        let adjustment = dto.quantity;
        if (dto.type === StockMovementType.OUT || dto.type === StockMovementType.SALE) {
            adjustment = -Math.abs(dto.quantity);
        } else if (dto.type === StockMovementType.IN || dto.type === StockMovementType.RETURN) {
            adjustment = Math.abs(dto.quantity);
        }
        // ADJUSTMENT type uses the sign of the quantity provided in the DTO

        await this.productRepository.updateStock(dto.productId, tenantId, adjustment);

        return movement;
    }
}
