import { Schema, model, Document } from 'mongoose';
import { Admin, AdminRole, AdminPermission } from '../../domain/entities/Admin';

export interface IAdminDocument extends Admin, Document {}

const adminSchema = new Schema<IAdminDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(AdminRole),
            default: AdminRole.SUPPORT,
            required: true
        },
        permissions: [{
            type: String,
            enum: Object.values(AdminPermission)
        }],
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                delete ret.passwordHash; // Never expose password hash
                return ret;
            }
        }
    }
);

// Indexes
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

export const AdminModel = model<IAdminDocument>('Admin', adminSchema);