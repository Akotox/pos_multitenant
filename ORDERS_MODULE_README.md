# 📋 Orders Module - Enterprise-Level Order Management

The Orders module provides comprehensive order management capabilities for businesses, including deferred payments, approval workflows, recurring orders, and advanced analytics.

## 🏗️ Architecture Overview

### Clean Architecture Implementation
- **Domain Layer**: Order entities, business rules, and repository interfaces
- **Application Layer**: Use cases and business logic orchestration
- **Infrastructure Layer**: Database models, repositories, and external services
- **Interface Layer**: Controllers, routes, and API endpoints

## 🚀 Key Features

### 📊 **Core Order Management**
- ✅ **Complete Order Lifecycle**: Draft → Approval → Confirmed → Production → Shipped → Delivered → Completed
- ✅ **Flexible Payment Terms**: Immediate, Net Days, End of Month, Installments, Custom
- ✅ **Multi-Item Orders**: Support for complex orders with multiple products
- ✅ **Address Management**: Separate billing and shipping addresses
- ✅ **Order Numbering**: Auto-generated unique order numbers with date-based format

### 💰 **Advanced Payment Features**
- ✅ **Deferred Payments**: Orders can be paid later with configurable due dates
- ✅ **Partial Payments**: Support for installment payments and partial payment tracking
- ✅ **Payment Terms**: Net 30, Net 60, End of Month, Custom installment plans
- ✅ **Payment Status Tracking**: Pending, Partial, Paid, Overdue, Cancelled, Refunded
- ✅ **Early Payment Discounts**: Configurable discount for early payments

### 🔄 **Enterprise Workflow Features**
- ✅ **Approval Workflows**: Multi-step approval process based on order value
- ✅ **Status Transitions**: Controlled status changes with validation
- ✅ **Audit Trail**: Complete history of status changes and modifications
- ✅ **Priority Management**: Low, Normal, High, Urgent, Critical priorities
- ✅ **Tags & Categories**: Flexible tagging system for organization

### 🔁 **Recurring Orders (Enterprise)**
- ✅ **Automated Recurring**: Daily, Weekly, Monthly, Quarterly, Yearly frequencies
- ✅ **Flexible Scheduling**: Custom intervals (e.g., every 2 weeks, every 3 months)
- ✅ **Auto-Approval**: Option to automatically approve recurring orders
- ✅ **End Conditions**: Maximum occurrences or end date limits
- ✅ **Template-Based**: Create orders from predefined templates

### 📈 **Advanced Analytics & Reporting**
- ✅ **Order Metrics**: Total orders, revenue, average order value, completion rates
- ✅ **Customer Insights**: Top customers, order history, payment patterns
- ✅ **Performance Tracking**: Delivery times, on-time delivery rates
- ✅ **Overdue Monitoring**: Automatic identification of overdue payments
- ✅ **Status Distribution**: Orders by status and payment status

### 🛠️ **Bulk Operations (Enterprise)**
- ✅ **Mass Updates**: Update status, priority, or payment terms for multiple orders
- ✅ **Bulk Notifications**: Send notifications to multiple customers
- ✅ **Export Operations**: Export order data in various formats
- ✅ **Discount Application**: Apply discounts to multiple orders simultaneously

## 📋 Order Statuses & Workflow

### Order Status Flow
```
DRAFT → PENDING_APPROVAL → APPROVED → CONFIRMED → IN_PRODUCTION → 
READY_TO_SHIP → SHIPPED → DELIVERED → COMPLETED

Alternative flows:
- Any status → CANCELLED
- Any status → ON_HOLD → Resume to previous flow
- DELIVERED/COMPLETED → RETURNED
```

### Payment Status Flow
```
PENDING → PARTIAL → PAID
       ↓
    OVERDUE (if past due date)
       ↓
    CANCELLED/REFUNDED
```

## 🔧 API Endpoints

### **Order Management**
```http
POST   /api/v1/orders                    # Create new order
GET    /api/v1/orders                    # List orders with filters
GET    /api/v1/orders/search?q=term     # Search orders
GET    /api/v1/orders/:id                # Get order by ID
GET    /api/v1/orders/number/:number     # Get order by number
PUT    /api/v1/orders/:id                # Update order
DELETE /api/v1/orders/:id                # Delete order
PUT    /api/v1/orders/:id/status         # Update order status
```

### **Customer Orders**
```http
GET    /api/v1/orders/customer/:customerId  # Get orders for customer
```

### **Payment Management**
```http
POST   /api/v1/orders/:id/payments       # Record payment
```

### **Approval Workflow**
```http
POST   /api/v1/orders/:id/approve        # Approve order
POST   /api/v1/orders/:id/reject         # Reject order
```

### **Templates**
```http
POST   /api/v1/orders/templates          # Create order template
GET    /api/v1/orders/templates/list     # List templates
POST   /api/v1/orders/templates/:id/create-order  # Create order from template
```

### **Analytics & Reports**
```http
GET    /api/v1/orders/metrics            # Order metrics and analytics
GET    /api/v1/orders/overdue            # Overdue orders
GET    /api/v1/orders/due-today          # Orders due today
GET    /api/v1/orders/pending-approval   # Orders pending approval
```

### **Enterprise Features**
```http
POST   /api/v1/orders/bulk-operations    # Create bulk operation
POST   /api/v1/orders/recurring/process  # Process recurring orders
```

## 📊 Data Models

### **Order Entity**
```typescript
interface Order {
    id?: string;
    orderNumber: string;           // Auto-generated: ORD-20241227-0001
    tenantId: string;
    customerId: string;
    userId: string;                // Creator
    
    // Order Details
    items: OrderItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
    
    // Status & Workflow
    status: OrderStatus;
    priority: OrderPriority;
    tags: string[];
    
    // Payment Information
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paymentTerms: PaymentTerms;
    dueDate?: Date;
    paidAmount: number;
    remainingAmount: number;
    
    // Dates
    orderDate: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    
    // Addresses
    billingAddress: Address;
    shippingAddress?: Address;
    
    // Enterprise Features
    approvalWorkflow?: ApprovalWorkflow;
    recurringOrder?: RecurringOrderConfig;
    contractId?: string;
    
    // Audit
    statusHistory: OrderStatusHistory[];
    createdAt: Date;
    updatedAt: Date;
}
```

### **Payment Terms**
```typescript
interface PaymentTerms {
    type: PaymentTermsType;        // IMMEDIATE, NET_DAYS, INSTALLMENTS, etc.
    daysNet?: number;              // Net 30, Net 60
    discountPercent?: number;      // Early payment discount
    discountDays?: number;         // Days to qualify for discount
    installments?: PaymentInstallment[];
}
```

### **Approval Workflow**
```typescript
interface ApprovalWorkflow {
    required: boolean;
    currentStep: number;
    totalSteps: number;
    steps: ApprovalStep[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

## 🔒 Security & Permissions

### **Role-Based Access Control**
- **OWNER**: Full access to all order operations
- **MANAGER**: Create, update, approve orders, view analytics
- **CASHIER**: Create orders, record payments, view assigned orders

### **Subscription Limits**
- **Sales Limits**: Enforced based on subscription plan
- **Feature Access**: Advanced features require higher-tier plans
- **API Limits**: Rate limiting based on subscription

## 💡 Usage Examples

### **Create Order with Payment Terms**
```typescript
POST /api/v1/orders
{
    "customerId": "customer123",
    "items": [
        {
            "productId": "prod123",
            "name": "Product Name",
            "sku": "SKU123",
            "quantity": 2,
            "unitPrice": 100.00,
            "taxPercent": 8.5
        }
    ],
    "billingAddress": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345",
        "country": "USA"
    },
    "paymentTerms": {
        "type": "NET_DAYS",
        "daysNet": 30,
        "discountPercent": 2,
        "discountDays": 10
    },
    "priority": "HIGH",
    "tags": ["urgent", "vip-customer"],
    "notes": "Rush order for important client"
}
```

### **Record Partial Payment**
```typescript
POST /api/v1/orders/order123/payments
{
    "amount": 150.00,
    "paymentMethod": "BANK_TRANSFER",
    "notes": "Partial payment received"
}
```

### **Create Recurring Order**
```typescript
POST /api/v1/orders
{
    // ... order details ...
    "recurringOrder": {
        "enabled": true,
        "frequency": "MONTHLY",
        "interval": 1,
        "endDate": "2024-12-31",
        "autoApprove": true
    }
}
```

### **Bulk Status Update**
```typescript
POST /api/v1/orders/bulk-operations
{
    "type": "UPDATE_STATUS",
    "orderIds": ["order1", "order2", "order3"],
    "parameters": {
        "status": "CONFIRMED",
        "reason": "Bulk confirmation after inventory check"
    }
}
```

## 📈 Analytics Features

### **Order Metrics**
- Total orders and revenue
- Average order value
- Completion rates
- Delivery performance
- Payment collection rates

### **Customer Analytics**
- Top customers by value
- Order frequency patterns
- Payment behavior analysis
- Customer lifetime value

### **Operational Insights**
- Orders by status distribution
- Overdue payment tracking
- Approval workflow bottlenecks
- Recurring order performance

## 🔄 Integration Points

### **With Existing Modules**
- **Customers**: Order creation and customer history
- **Products**: Item validation and inventory updates
- **Sales**: Conversion from orders to sales
- **Payments**: Payment processing and tracking
- **Pricing**: Subscription limits and feature access

### **External Integrations**
- **Accounting Systems**: Export order data
- **Shipping Providers**: Tracking and delivery updates
- **Payment Gateways**: Payment processing
- **CRM Systems**: Customer relationship management

## 🚀 Enterprise Features

### **Advanced Approval Workflows**
- Multi-level approval based on order value
- Role-based approval routing
- Approval delegation and escalation
- Approval analytics and bottleneck identification

### **Recurring Order Management**
- Template-based recurring orders
- Flexible scheduling options
- Automatic inventory allocation
- Recurring order analytics

### **Bulk Operations**
- Mass order updates
- Bulk export capabilities
- Batch notification sending
- Performance monitoring

### **Advanced Analytics**
- Custom reporting dashboards
- Predictive analytics
- Customer behavior insights
- Operational efficiency metrics

## 🛠️ Setup & Configuration

### **Database Indexes**
The module creates optimized indexes for:
- Order number uniqueness
- Tenant-based queries
- Status and payment status filtering
- Date range queries
- Customer order history
- Full-text search

### **Subscription Integration**
- Automatic limit enforcement
- Feature access control
- Usage tracking and reporting
- Upgrade prompts for advanced features

### **Cron Jobs**
- Recurring order processing
- Overdue payment notifications
- Status update reminders
- Analytics data aggregation

## 📋 Business Rules

### **Order Creation**
- Minimum one item required
- Customer must exist and be active
- Billing address is mandatory
- Payment terms default to Net 30

### **Status Transitions**
- Only valid transitions allowed
- Approval required for high-value orders
- Audit trail maintained for all changes
- Notifications sent on status changes

### **Payment Processing**
- Payments cannot exceed remaining balance
- Partial payments update installment schedules
- Overdue status automatically applied
- Payment history maintained

### **Recurring Orders**
- Based on original order template
- Automatic inventory checks
- Configurable approval requirements
- End conditions respected

This Orders module provides enterprise-level order management capabilities that scale with business needs while maintaining flexibility and ease of use.