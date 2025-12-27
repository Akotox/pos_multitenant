# Multi-Tenant POS API Documentation

## Overview
This is a comprehensive multi-tenant Point of Sale (POS) system with enterprise features, built using clean architecture principles.

## Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.pos-system.com/api/v1`

## Swagger Documentation
Interactive API documentation is available at `/api-docs` when the server is running.

## Authentication
The API uses JWT (JSON Web Tokens) for authentication:
- **Bearer Token**: For tenant users (`Authorization: Bearer <token>`)
- **Admin Token**: For administrative operations (`Authorization: Bearer <admin_token>`)

## API Endpoints Summary

### Authentication & Tenants
- `POST /auth/register` - Register new tenant or user
- `POST /auth/login` - User login
- `GET /tenants/me` - Get current tenant details
- `GET /tenants/{id}` - Get tenant by ID (Owner only)

### Orders Management
- `GET /orders` - List orders with advanced filtering
- `POST /orders` - Create new order
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order
- `POST /orders/bulk` - Bulk create orders
- `PUT /orders/bulk` - Bulk update orders
- `POST /orders/{id}/duplicate` - Duplicate order
- `GET /orders/templates` - List order templates
- `POST /orders/templates` - Create order template
- `POST /orders/recurring` - Create recurring order
- `GET /orders/analytics` - Order analytics

### Sales Processing
- `POST /sales` - Process new sale
- `GET /sales` - List all sales
- `GET /sales/{id}` - Get sale details

### Products Management
- `GET /products` - List all products
- `POST /products` - Create new product (Manager/Owner)
- `GET /products/{id}` - Get product details
- `PUT /products/{id}` - Update product (Manager/Owner)
- `DELETE /products/{id}` - Delete product (Manager/Owner)

### Categories Management
- `GET /categories` - List all categories
- `POST /categories` - Create new category (Manager/Owner)
- `GET /categories/{id}` - Get category details
- `PUT /categories/{id}` - Update category (Manager/Owner)
- `DELETE /categories/{id}` - Delete category (Manager/Owner)

### Customer Management
- `GET /customers` - List customers with search
- `POST /customers` - Create new customer
- `GET /customers/{id}` - Get customer details
- `PUT /customers/{id}` - Update customer
- `DELETE /customers/{id}` - Delete customer (Manager/Owner)

### Inventory Management
- `GET /inventory/history/{productId}` - View stock history
- `POST /inventory/adjust` - Manually adjust stock (Manager/Owner)

### Reports & Analytics
- `GET /reports/daily-sales` - Daily sales summary (Manager/Owner)
- `GET /reports/product-performance` - Product performance stats (Manager/Owner)
- `GET /reports/dashboard` - Dashboard overview (Manager/Owner)
- `GET /reports/advanced` - Advanced analytics (Manager/Owner)

### Payments & Subscriptions
- `GET /payments/subscription` - Get subscription status
- `POST /payments/renew` - Renew subscription (Owner only)

### Admin Operations
- `POST /admin/login` - Admin login
- `GET /admin/tenants` - List all tenants
- `GET /admin/tenants/{id}` - Get tenant details
- `PUT /admin/tenants/{id}/status` - Update tenant status
- `GET /admin/analytics` - System analytics
- `GET /admin/revenue` - Revenue analytics
- `POST /admin/notifications` - Send notifications

### Pricing Management
- `GET /pricing/plans` - List pricing plans (public)
- `POST /pricing/subscribe` - Subscribe to plan
- `GET /pricing/subscription` - Get subscription details
- `PUT /pricing/subscription` - Update subscription
- `DELETE /pricing/subscription` - Cancel subscription

## User Roles & Permissions

### Tenant Roles
- **OWNER**: Full access to tenant resources
- **MANAGER**: Management operations (products, categories, reports)
- **CASHIER**: Basic sales operations

### Admin Roles
- **SUPER_ADMIN**: Full system access
- **ADMIN**: General administrative operations
- **BILLING_ADMIN**: Billing and subscription management
- **SUPPORT**: Customer support operations

## Enterprise Features

### Order Management
- Bulk operations for high-volume processing
- Order templates for recurring patterns
- Recurring orders with automated scheduling
- Advanced filtering and search
- Order analytics and reporting

### Subscription Management
- Multiple pricing tiers
- Usage-based billing
- Automatic subscription renewal
- Grace period handling
- Subscription analytics

### Multi-tenant Architecture
- Complete data isolation
- Tenant-specific configurations
- Scalable resource allocation
- Centralized admin management

## Error Handling
All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

## Pagination
List endpoints support pagination:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Rate Limiting
API endpoints are rate-limited based on subscription tier:
- **Basic**: 100 requests/minute
- **Professional**: 500 requests/minute  
- **Enterprise**: 2000 requests/minute

## Webhooks
The system supports webhooks for:
- Order status changes
- Payment events
- Subscription updates
- Inventory alerts

## Getting Started
1. Register a new tenant: `POST /auth/register`
2. Login to get JWT token: `POST /auth/login`
3. Use the token in Authorization header for subsequent requests
4. Access interactive documentation at `/api-docs`

For detailed request/response schemas and examples, visit the Swagger documentation at `/api-docs` when the server is running.