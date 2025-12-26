# Multi-Tenant POS Backend -- Clean Architecture (Module-Based)

## Tech Stack

-   TypeScript
-   Node.js
-   Express
-   MongoDB + Mongoose
-   JWT Authentication
-   Zod Validation
-   Clean Architecture

## Folder Structure

src/ modules/ auth/ tenants/ users/ products/ categories/ inventory/
sales/ payments/ customers/ reports/

Each module contains: - domain - application - interfaces -
infrastructure

## Architectural Rules

-   Domain has no external dependencies
-   Application orchestrates use cases
-   Infrastructure implements persistence & external services
-   Interfaces expose HTTP APIs
-   Multi-tenancy enforced via tenantId from JWT

## Multi-Tenancy

-   Shared DB, shared collections
-   tenantId on every entity
-   Never accept tenantId from request body
-   Always filter queries by tenantId

## Core Modules Overview

Auth, Tenants, Users, Products, Categories, Inventory, Sales, Payments,
Customers, Reports

## Transactions

-   MongoDB sessions for sales, inventory & payments
-   Atomic operations only

## Security

-   RBAC (OWNER, MANAGER, CASHIER)
-   Password hashing
-   Rate limiting
-   Audit logs

## Roadmap

1.  Scaffold project
2.  Auth & tenant bootstrap
3.  Product & inventory
4.  Sales transactions
5.  Reports
6.  Hardening & tests
