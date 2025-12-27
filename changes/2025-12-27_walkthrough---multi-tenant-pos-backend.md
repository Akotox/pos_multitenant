# Walkthrough - Multi-Tenant POS Backend

I have successfully implemented the Multi-Tenant POS backend following Clean Architecture principles. Below is a summary of the accomplishments and a guide to the project structure.

## Core Features Implemented

- **Multi-Tenancy**: Shared database and shared collections approach, isolated by `tenantId`. Supports accounts associated with multiple tenants.
- **Authentication & RBAC**: JWT-based authentication. If an email is registered across multiple tenants, the login flow returns a list for selection. Supports joining existing tenants during registration.
- **Products & Categories**: Full CRUD for product and category management with tenant isolation. Features backend SKU generation (format: `PRD-TIMESTAMP-RANDOM`) and advanced fields like `buyingPrice` and `imageUrl`.
- **Inventory Management**: Tracks stock movements (IN, OUT, SALE, ADJUSTMENT, RETURN). Atomic stock updates during sales using MongoDB transactions.
- **Customer Management**: Complete profile management with search capabilities. Validation enforces unique emails and phone numbers per tenant.
- **Sales Processing**: Atomic transactions for order creation, stock deduction, and optional customer linking using MongoDB sessions. Validation ensures referenced customers exist.
- **Advanced Analytics**:
    - **Dashboard**: Daily sales, gross profit, profit margin, and low stock alerts.
    - **Insights**: Top customers by spend, sales heatmap (peak hours), and product performance.
- **Payments & Subscription**: Full subscription lifecycle management including trial logic, grace periods, and automated expiry via background cron jobs.

## Product Module Refactoring details

- **Backend SKU Generation**: Products no longer require an SKU in the request; they are automatically generated in the format `PRD-XXXXXX-YYY`.
- **New Fields**: Added `buyingPrice` (mandatory) and `imageUrl` (optional) to support better inventory management and UI display.

## Guide to Subscription Management

- **Trial Period**: Automatically started upon registration (14 days).
- **Grace Period**: Active subscriptions enter a 3-day grace period upon expiry before being suspended.
- **Middleware Protection**: All inventory and sales routes are protected by a global `subscriptionGuard`.
- **Manual Renewal**: Reach out to `/api/payments/renew` to simulate a successful payment and reactivate/extend subscriptions.

## Project Structure

The project follows a module-based Clean Architecture:

```
src/
├── core/                  # Shared utilities, errors, and middlewares
│   ├── database/          # Mongoose connection
│   ├── errors/           # Custom AppError classes
│   ├── middlewares/      # Auth, Tenant context, Error Handler
│   └── utils/            # Security (Bcrypt, JWT)
└── modules/
    ├── auth/             # Tenant Registration and User Login
    ├── categories/       # Category Management
    ├── products/         # Product Management
    ├── sales/            # Transactional Order Processing
    └── reports/          # Sales Analytics & Aggregations
```

Each module contains:
- `domain/`: Repository interfaces.
- `application/`: Use cases orchestrating the logic.
- `interfaces/`: Controllers, Routes, and DTOs (Zod schemas).
- `infrastructure/`: Mongoose models and repository implementations.

## Verification of Work

### API Endpoints
- `POST /api/auth/register`: Bootstrap tenant and owner.
- `POST /api/auth/login`: Authenticate and get token.
- `GET /api/products`: List products for the authenticated tenant.
- `POST /api/sales`: Process a sale (atomic transaction).
- `GET /api/reports/daily-sales`: View analytics.

### Code Quality
- **TypeScript**: Strict type checking and custom type extensions for Express.
- **Validation**: Input validation using Zod.
- **Error Handling**: Centralized error management with operational safety.
- **Security**: Password hashing and JWT security.

## How to Run

1.  **Install dependencies**: `npm install`
2.  **Setup environment**: Ensure MongoDB is running and update `.env`.
3.  **Run in development**: `npm run dev`
4.  **Build and Start**: `npm run build && npm start`
