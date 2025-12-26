import { Schema, model, Document, Types } from 'mongoose';
import { PaymentStatus } from '../../../domain/enums/PaymentStatus';

export interface IPayment extends Document {
    tenantId: Types.ObjectId;
    subscriptionId: Types.ObjectId;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: string;
    providerTransactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },
        provider: { type: String, required: true },
        providerTransactionId: { type: String },
    },
    { timestamps: true }
);

export const PaymentModel = model<IPayment>('Payment', paymentSchema);
