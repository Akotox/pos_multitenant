import { Schema, model, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
    tenantId: Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        address: { type: String },
        notes: { type: String },
    },
    { timestamps: true }
);

// Ensure unique email/phone per tenant if provided
customerSchema.index({ tenantId: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true, $type: 'string' } } });
customerSchema.index({ tenantId: 1, phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true, $type: 'string' } } });

export const CustomerModel = model<ICustomer>('Customer', customerSchema);
