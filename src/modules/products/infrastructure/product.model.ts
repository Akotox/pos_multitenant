import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    sku: string;
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
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        buyingPrice: { type: Number, required: true, min: 0, default: 0 },
        imageUrl: { type: String },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        stockQuantity: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Unique SKU per tenant
productSchema.index({ sku: 1, tenantId: 1 }, { unique: true });

export const ProductModel = model<IProduct>('Product', productSchema);
