import { Schema, model, Document, Types } from 'mongoose';

export enum UserRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    CASHIER = 'CASHIER',
}

export interface IUser extends Document {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    tenantId: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.CASHIER,
        },
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
                delete ret.passwordHash; // Never expose password hash
                return ret;
            }
        }
    }
);

// Compound index to ensure email uniqueness per tenant
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

export const UserModel = model<IUser>('User', userSchema);
