import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
    id?: string;
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    price: number;
    buyingPrice: number;
    imageUrl?: string;
    categoryId: Types.ObjectId;
    tenantId: Types.ObjectId;
    stockQuantity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        sku: { type: String, required: true },
        barcode: { type: String },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        buyingPrice: { type: Number, required: true, min: 0, default: 0 },
        imageUrl: { type: String },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        stockQuantity: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
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

// Unique SKU per tenant
productSchema.index({ sku: 1, tenantId: 1 }, { unique: true });

export const ProductModel = model<IProduct>('Product', productSchema);
