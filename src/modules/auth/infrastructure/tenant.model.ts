import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
    id?: string;
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
    { 
        timestamps: true,
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

export const TenantModel = model<ITenant>('Tenant', tenantSchema);
