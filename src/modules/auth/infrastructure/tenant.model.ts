import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
    name: string;
    subdomain?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
    {
        name: { type: String, required: true },
        subdomain: { type: String, unique: true, sparse: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const TenantModel = model<ITenant>('Tenant', tenantSchema);
