import { Schema, model, Document, Types } from 'mongoose';

export interface ISaleItem {
    productId: Types.ObjectId;
    name: string;
    price: number;
    buyingPrice: number;
    quantity: number;
    subtotal: number;
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    MOBILE = 'MOBILE',
}

export interface ISale extends Document {
    items: ISaleItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    tenantId: Types.ObjectId;
    userId: Types.ObjectId;
    customerId?: Types.ObjectId; // Optional link to customer
    createdAt: Date;
    updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    buyingPrice: { type: Number, required: true, default: 0 }, // Cost price at time of sale
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
});

const saleSchema = new Schema<ISale>(
    {
        items: [saleItemSchema],
        totalAmount: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            default: PaymentMethod.CASH,
        },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    },
    { timestamps: true }
);

export const SaleModel = model<ISale>('Sale', saleSchema);
