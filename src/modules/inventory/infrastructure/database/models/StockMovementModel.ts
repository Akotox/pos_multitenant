import { Schema, model, Document, Types } from 'mongoose';
import { StockMovementType } from '../../../domain/StockMovementType';

export interface IStockMovement extends Document {
    productId: Types.ObjectId;
    tenantId: Types.ObjectId;
    type: StockMovementType;
    quantity: number; // Positive for IN, Negative for OUT (usually) but better to keep positive and use 'type'
    reason?: string;
    referenceId?: string; // e.g., SaleId or PurchaseOrderId
    createdAt: Date;
    updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        type: {
            type: String,
            enum: Object.values(StockMovementType),
            required: true,
        },
        quantity: { type: Number, required: true },
        reason: { type: String },
        referenceId: { type: String },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc: any, ret: any) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Index for fast lookups per product and tenant
stockMovementSchema.index({ productId: 1, tenantId: 1 });

export const StockMovementModel = model<IStockMovement>('StockMovement', stockMovementSchema);
