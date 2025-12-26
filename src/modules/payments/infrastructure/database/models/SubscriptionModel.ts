import { Schema, model, Document, Types } from 'mongoose';
import { SubscriptionStatus } from '../../../domain/enums/SubscriptionStatus';

export interface ISubscription extends Document {
    tenantId: Types.ObjectId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    gracePeriodEndsAt?: Date;
    isTrial: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
        status: {
            type: String,
            enum: Object.values(SubscriptionStatus),
            default: SubscriptionStatus.TRIAL,
        },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, required: true },
        gracePeriodEndsAt: { type: Date },
        isTrial: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const SubscriptionModel = model<ISubscription>('Subscription', subscriptionSchema);
