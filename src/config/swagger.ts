import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-Tenant POS API',
      version: '1.0.0',
      description: 'A comprehensive multi-tenant Point of Sale system with enterprise features',
      contact: {
        name: 'API Support',
        email: 'support@pos-system.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.pos-system.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for tenant authentication'
        },
        adminAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for admin authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        },
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: '123 Main St' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            zipCode: { type: 'string', example: '10001' },
            country: { type: 'string', example: 'USA' }
          },
          required: ['street', 'city', 'state', 'zipCode', 'country']
        },
        OrderItem: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Product Name' },
            quantity: { type: 'integer', minimum: 1, example: 2 },
            unitPrice: { type: 'number', minimum: 0, example: 29.99 },
            subtotal: { type: 'number', example: 59.98 }
          },
          required: ['productId', 'name', 'quantity', 'unitPrice']
        },
        PaymentTerms: {
          type: 'object',
          properties: {
            dueDate: { type: 'string', format: 'date-time' },
            paymentMethod: { 
              type: 'string', 
              enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'CREDIT_ACCOUNT', 'FINANCING'] 
            },
            installments: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                count: { type: 'integer', minimum: 1 },
                frequency: { type: 'string', enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY'] }
              }
            },
            lateFeePercentage: { type: 'number', minimum: 0, maximum: 100 },
            discountPercentage: { type: 'number', minimum: 0, maximum: 100 }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            orderNumber: { type: 'string', example: 'ORD-2024-001' },
            customerId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' }
            },
            subtotal: { type: 'number', example: 100.00 },
            taxAmount: { type: 'number', example: 8.50 },
            discountAmount: { type: 'number', example: 5.00 },
            totalAmount: { type: 'number', example: 103.50 },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'RETURNED']
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']
            },
            billingAddress: { $ref: '#/components/schemas/Address' },
            shippingAddress: { $ref: '#/components/schemas/Address' },
            paymentTerms: { $ref: '#/components/schemas/PaymentTerms' },
            expectedDeliveryDate: { type: 'string', format: 'date-time' },
            tags: {
              type: 'array',
              items: { type: 'string' }
            },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PricingPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Professional' },
            description: { type: 'string', example: 'Perfect for growing businesses' },
            price: { type: 'integer', example: 2999, description: 'Price in cents' },
            currency: { type: 'string', example: 'USD' },
            billingInterval: { type: 'string', enum: ['MONTHLY', 'YEARLY'] },
            features: {
              type: 'array',
              items: { type: 'string' },
              example: ['Advanced Analytics', 'Multi-location Support']
            },
            limits: {
              type: 'object',
              properties: {
                maxUsers: { type: 'integer', example: 10 },
                maxProducts: { type: 'integer', example: 1000 },
                maxSalesPerMonth: { type: 'integer', example: 5000 },
                customReports: { type: 'boolean', example: true },
                multiLocation: { type: 'boolean', example: true },
                advancedAnalytics: { type: 'boolean', example: true }
              }
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'admin@example.com' },
            role: { 
              type: 'string', 
              enum: ['SUPER_ADMIN', 'ADMIN', 'BILLING_ADMIN', 'SUPPORT'] 
            },
            permissions: {
              type: 'array',
              items: { type: 'string' }
            },
            isActive: { type: 'boolean', example: true },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'user@example.com' },
            role: { 
              type: 'string', 
              enum: ['OWNER', 'MANAGER', 'CASHIER'] 
            },
            tenantId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Tenant: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            companyName: { type: 'string', example: 'Acme Corp' },
            email: { type: 'string', example: 'contact@acme.com' },
            phone: { type: 'string', example: '+1234567890' },
            address: { type: 'string', example: '123 Business St, City, State' },
            subscriptionStatus: { 
              type: 'string', 
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'] 
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Premium Coffee' },
            description: { type: 'string', example: 'High-quality arabica coffee beans' },
            price: { type: 'number', example: 12.99 },
            buyingPrice: { type: 'number', example: 8.50 },
            categoryId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            stockQuantity: { type: 'integer', example: 100 },
            imageUrl: { type: 'string', example: 'https://example.com/coffee.jpg' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Beverages' },
            description: { type: 'string', example: 'Hot and cold beverages' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', example: 'jane@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            address: { type: 'string', example: '456 Customer Ave, City, State' },
            notes: { type: 'string', example: 'VIP customer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Sale: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  name: { type: 'string' },
                  quantity: { type: 'integer' },
                  unitPrice: { type: 'number' },
                  subtotal: { type: 'number' }
                }
              }
            },
            subtotal: { type: 'number', example: 25.98 },
            taxAmount: { type: 'number', example: 2.08 },
            totalAmount: { type: 'number', example: 28.06 },
            paymentMethod: { 
              type: 'string', 
              enum: ['CASH', 'CARD', 'MOBILE'] 
            },
            customerId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        InventoryMovement: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            productId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            type: { 
              type: 'string', 
              enum: ['IN', 'OUT', 'ADJUSTMENT'] 
            },
            quantity: { type: 'integer', example: 50 },
            reason: { type: 'string', example: 'Stock replenishment' },
            previousQuantity: { type: 'integer', example: 25 },
            newQuantity: { type: 'integer', example: 75 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            tenantId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            status: { 
              type: 'string', 
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'] 
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            planId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'User authentication and tenant registration'
      },
      {
        name: 'Tenants',
        description: 'Tenant management operations'
      },
      {
        name: 'Orders',
        description: 'Order management operations'
      },
      {
        name: 'Sales',
        description: 'Sales processing and transaction management'
      },
      {
        name: 'Products',
        description: 'Product catalog management'
      },
      {
        name: 'Categories',
        description: 'Product category management'
      },
      {
        name: 'Customers',
        description: 'Customer relationship management'
      },
      {
        name: 'Inventory',
        description: 'Stock and inventory management'
      },
      {
        name: 'Reports',
        description: 'Analytics and business reporting'
      },
      {
        name: 'Payments',
        description: 'Subscription and payment management'
      },
      {
        name: 'Admin',
        description: 'Administrative operations'
      },
      {
        name: 'Pricing',
        description: 'Pricing and subscription management'
      }
    ]
  },
  apis: [
    './src/modules/auth/interfaces/*.ts',
    './src/modules/orders/interfaces/routes/*.ts',
    './src/modules/admin/interfaces/routes/*.ts',
    './src/modules/pricing/interfaces/routes/*.ts',
    './src/modules/sales/interfaces/*.ts',
    './src/modules/products/interfaces/*.ts',
    './src/modules/categories/interfaces/*.ts',
    './src/modules/customers/interfaces/http/routes/*.ts',
    './src/modules/inventory/interfaces/http/routes/*.ts',
    './src/modules/payments/interfaces/http/routes/*.ts',
    './src/modules/reports/interfaces/*.ts'
  ]
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Multi-Tenant POS API Documentation'
  }));
};

export default specs;