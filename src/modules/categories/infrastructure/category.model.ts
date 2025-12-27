import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
    id?: string;
    name: string;
    description?: string;
    tenantId: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        description: { type: String },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

// Unique category name per tenant
categorySchema.index({ name: 1, tenantId: 1 }, { unique: true });

export const CategoryModel = model<ICategory>('Category', categorySchema);
