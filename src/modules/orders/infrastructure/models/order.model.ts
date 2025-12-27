import { Schema, model, Document, Types } from 'mongoose';
import { 
    Order, 
    OrderItem, 
    OrderStatus, 
    OrderPriority, 
    PaymentStatus, 
    PaymentMethod,
    PaymentTerms,
    PaymentTermsType,
    PaymentInstallment,
    ApprovalWorkflow,
    ApprovalStep,
    RecurringOrderConfig,
    RecurringFrequency,
    OrderStatusHistory,
    OrderTemplate,
    BulkOrderOperation,
    BulkOperationType,
    Address,
    WarrantyInfo
} from '../../domain/entities/Order';

export interface IOrderDocument extends Omit<Order, 'tenantId' | 'customerId' | 'userId'>, Document {
    tenantId: Types.ObjectId;
    customerId: Types.ObjectId;
    userId: Types.ObjectId;
}

// Sub-schemas
const addressSchema = new Schema<Address>({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    contactName: { type: String },
    contactPhone: { type: String }
}, { _id: false });

const warrantyInfoSchema = new Schema<WarrantyInfo>({
    duration: { type: Number, required: true },
    type: { type: String, enum: ['MANUFACTURER', 'EXTENDED', 'CUSTOM'], required: true },
    terms: { type: String }
}, { _id: false });

const orderItemSchema = new Schema<OrderItem>({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxPercent: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    customFields: { type: Schema.Types.Mixed },
    serialNumbers: [{ type: String }],
    warrantyInfo: warrantyInfoSchema
}, {
    toJSON: {
        transform: function (doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

const paymentInstallmentSchema = new Schema<PaymentInstallment>({
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    paidDate: { type: Date },
    paidAmount: { type: Number, min: 0 }
}, {
    toJSON: {
        transform: function (doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

const paymentTermsSchema = new Schema<PaymentTerms>({
    type: { type: String, enum: Object.values(PaymentTermsType), required: true },
    daysNet: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    discountDays: { type: Number, min: 0 },
    installments: [paymentInstallmentSchema]
}, { _id: false });

const approvalStepSchema = new Schema<ApprovalStep>({
    stepNumber: { type: Number, required: true },
    approverRole: { type: String, required: true },
    approverId: { type: String },
    approverName: { type: String },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    comments: { type: String },
    approvedAt: { type: Date },
    requiredAmount: { type: Number, min: 0 }
}, { _id: false });

const approvalWorkflowSchema = new Schema<ApprovalWorkflow>({
    required: { type: Boolean, default: false },
    currentStep: { type: Number, default: 1 },
    totalSteps: { type: Number, required: true },
    steps: [approvalStepSchema],
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { _id: false });

const recurringOrderConfigSchema = new Schema<RecurringOrderConfig>({
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: Object.values(RecurringFrequency), required: true },
    interval: { type: Number, required: true, min: 1 },
    nextOrderDate: { type: Date },
    endDate: { type: Date },
    maxOccurrences: { type: Number, min: 1 },
    currentOccurrence: { type: Number, default: 0 },
    autoApprove: { type: Boolean, default: false }
}, { _id: false });

const orderStatusHistorySchema = new Schema<OrderStatusHistory>({
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    changedBy: { type: String, required: true },
    changedByName: { type: String, required: true },
    reason: { type: String },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now }
}, {
    toJSON: {
        transform: function (doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

// Main Order Schema
const orderSchema = new Schema<IOrderDocument>(
    {
        orderNumber: { type: String, required: true, unique: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        
        // Order Details
        items: [orderItemSchema],
        subtotal: { type: Number, required: true, min: 0 },
        taxAmount: { type: Number, default: 0, min: 0 },
        discountAmount: { type: Number, default: 0, min: 0 },
        shippingAmount: { type: Number, default: 0, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        
        // Status & Workflow
        status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.DRAFT },
        priority: { type: String, enum: Object.values(OrderPriority), default: OrderPriority.NORMAL },
        tags: [{ type: String }],
        
        // Payment Information
        paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
        paymentMethod: { type: String, enum: Object.values(PaymentMethod) },
        paymentTerms: { type: paymentTermsSchema, required: true },
        dueDate: { type: Date },
        paidAmount: { type: Number, default: 0, min: 0 },
        remainingAmount: { type: Number, default: 0, min: 0 },
        
        // Dates
        orderDate: { type: Date, default: Date.now },
        expectedDeliveryDate: { type: Date },
        actualDeliveryDate: { type: Date },
        
        // Customer Information
        billingAddress: { type: addressSchema, required: true },
        shippingAddress: { type: addressSchema },
        
        // Notes & Communication
        notes: { type: String },
        internalNotes: { type: String },
        
        // Enterprise Features
        approvalWorkflow: { type: approvalWorkflowSchema },
        recurringOrder: { type: recurringOrderConfigSchema },
        contractId: { type: String },
        
        // Audit Trail
        statusHistory: [orderStatusHistorySchema]
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

// Indexes for performance
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ tenantId: 1, status: 1 });
orderSchema.index({ tenantId: 1, customerId: 1 });
orderSchema.index({ tenantId: 1, userId: 1 });
orderSchema.index({ tenantId: 1, paymentStatus: 1 });
orderSchema.index({ tenantId: 1, dueDate: 1 });
orderSchema.index({ tenantId: 1, orderDate: -1 });
orderSchema.index({ tenantId: 1, priority: 1 });
orderSchema.index({ tenantId: 1, tags: 1 });
orderSchema.index({ 'recurringOrder.nextOrderDate': 1 });
orderSchema.index({ 'approvalWorkflow.status': 1 });

// Text search index
orderSchema.index({
    orderNumber: 'text',
    'items.name': 'text',
    'items.sku': 'text',
    notes: 'text'
});

export const OrderModel = model<IOrderDocument>('Order', orderSchema);

// Order Template Schema
export interface IOrderTemplateDocument extends Omit<OrderTemplate, 'tenantId' | 'customerId' | 'createdBy'>, Document {
    tenantId: Types.ObjectId;
    customerId?: Types.ObjectId;
    createdBy: Types.ObjectId;
}

const orderTemplateSchema = new Schema<IOrderTemplateDocument>(
    {
        name: { type: String, required: true },
        description: { type: String },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
        items: [orderItemSchema],
        paymentTerms: { type: paymentTermsSchema, required: true },
        tags: [{ type: String }],
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
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

orderTemplateSchema.index({ tenantId: 1, isActive: 1 });
orderTemplateSchema.index({ tenantId: 1, customerId: 1 });

export const OrderTemplateModel = model<IOrderTemplateDocument>('OrderTemplate', orderTemplateSchema);

// Bulk Operation Schema
export interface IBulkOrderOperationDocument extends Document {
    type: BulkOperationType;
    orderIds: string[];
    parameters: Record<string, any>;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    processedCount: number;
    totalCount: number;
    operationErrors: string[]; // Renamed to avoid conflict with Document.errors
    createdBy: Types.ObjectId;
    completedAt?: Date;
}

const bulkOrderOperationSchema = new Schema<IBulkOrderOperationDocument>(
    {
        type: { type: String, enum: Object.values(BulkOperationType), required: true },
        orderIds: [{ type: String, required: true }],
        parameters: { type: Schema.Types.Mixed, default: {} },
        status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'], default: 'PENDING' },
        processedCount: { type: Number, default: 0 },
        totalCount: { type: Number, required: true },
        operationErrors: [{ type: String }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        completedAt: { type: Date }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                // Map operationErrors back to errors for API consistency
                ret.errors = ret.operationErrors;
                delete ret.operationErrors;
                return ret;
            }
        }
    }
);

bulkOrderOperationSchema.index({ status: 1 });
bulkOrderOperationSchema.index({ createdBy: 1 });
bulkOrderOperationSchema.index({ createdAt: -1 });

export const BulkOrderOperationModel = model<IBulkOrderOperationDocument>('BulkOrderOperation', bulkOrderOperationSchema);