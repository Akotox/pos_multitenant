# Payments & Subscription Module -- Multi-Tenant POS (Clean Architecture)

## Purpose
This module handles **tenant subscriptions and payments**. A tenant **must have an active subscription** to access the POS system. If a subscription expires or payment fails, **all services are suspended**.

---

## Responsibilities
- Subscription plan management (including Trial logic)
- Tenant billing lifecycle & automated expiry checks
- Payment processing & Webhook handling
- Subscription enforcement (Global Middleware)
- Service suspension, grace periods, & reactivation

---

## Module Structure
payments/
├── domain/
│   ├── entities/
│   │   ├── Subscription.ts (Added: gracePeriodEndsAt)
│   │   ├── Payment.ts
│   │   └── Invoice.ts
│   ├── value-objects/
│   │   ├── Money.ts
│   │   └── BillingPeriod.ts
│   ├── enums/
│   │   ├── SubscriptionStatus.ts (ACTIVE, EXPIRED, SUSPENDED, TRIAL, GRACE_PERIOD)
│   │   └── PaymentStatus.ts
│   └── repositories/
│       ├── SubscriptionRepository.ts
│       └── PaymentRepository.ts
├── application/
│   ├── use-cases/
│   │   ├── CreateSubscriptionUseCase.ts
│   │   ├── StartTrialUseCase.ts (New)
│   │   ├── ProcessSubscriptionPaymentUseCase.ts
│   │   ├── HandleWebhookUseCase.ts (New)
│   │   ├── RenewSubscriptionUseCase.ts
│   │   ├── CheckSubscriptionExpiryUseCase.ts (New)
│   │   ├── SuspendTenantUseCase.ts
│   │   └── ReactivateTenantUseCase.ts
│   ├── dto/
│   └── services/
│       └── BillingService.ts
├── infrastructure/
│   ├── database/
│   │   ├── models/
│   │   │   ├── SubscriptionModel.ts
│   │   │   └── PaymentModel.ts
│   │   └── repositories/
│   │       ├── SubscriptionRepositoryImpl.ts
│   │       └── PaymentRepositoryImpl.ts
│   ├── providers/
│   │   ├── StripeProvider.ts
│   │   ├── PayPalProvider.ts
│   │   └── MobileMoneyProvider.ts
│   └── jobs/
│       └── SubscriptionCron.ts (New: Expiry & Grace Period checks)
└── interfaces/
    └── http/
        ├── controllers/
        │   └── PaymentsController.ts
        ├── routes/
        │   └── payments.routes.ts
        ├── middleware/
        │   └── SubscriptionGuardMiddleware.ts (New)
        └── validators/
            └── index.ts

---

## Domain Layer

### Subscription Entity Extensions
Fields:
- `status`: TRIAL, ACTIVE, GRACE_PERIOD, EXPIRED, SUSPENDED
- `gracePeriodEndsAt`: Date (Optional)
- `isTrial`: Boolean

Rules:
- **Trial Period**: One-time use per tenant. Fixed duration (e.g., 14 days).
- **Grace Period**: If a renewal payment fails, the status moves to `GRACE_PERIOD` rather than immediate `SUSPENDED`.

---

## Application Layer

### 1. Trial Subscription Logic (Onboarding)
**StartTrialUseCase**:
- Check if tenant has ever used a trial.
- If no, create subscription with status `TRIAL`.
- Set `endDate` to `now + 14 days`.
- Set tenant status to `ACTIVE`.

### 2. Webhook Handling Flow (Payment -> Reactivation)
**HandleWebhookUseCase**:
1. Receive event from provider (e.g., `invoice.paid`).
2. Verify webhook signature.
3. Identify `tenantId` and `subscriptionId` from metadata.
4. Execute `ProcessSubscriptionPaymentUseCase`:
    - Update `Payment` record to `SUCCESS`.
    - Calculate new `endDate`.
    - Update `Subscription` status to `ACTIVE`.
    - Trigger `ReactivateTenantUseCase` to lift global blocks.

---

## Infrastructure Layer

### Background Jobs (Cron)
**SubscriptionCron**:
- **Frequency**: Runs every 24 hours (or hourly for tighter enforcement).
- **Task A (Expiry)**: Find all `ACTIVE` or `TRIAL` subscriptions where `endDate < now`.
    - If `Trial`: Set to `EXPIRED` & `SuspendTenant`.
    - If `Active`: Set to `GRACE_PERIOD`, set `gracePeriodEndsAt`, and notify tenant.
- **Task B (Grace Period Expiry)**: Find all `GRACE_PERIOD` where `gracePeriodEndsAt < now`.
    - Set status to `SUSPENDED`.
    - Execute `SuspendTenantUseCase`.

---

## Interfaces Layer

### Global SubscriptionGuardMiddleware
This middleware is registered globally after Authentication.

**Logic**:
```typescript
async function SubscriptionGuard(req, res, next) {
  const { tenantId } = req.auth;
  const subscription = await repo.findByTenantId(tenantId);

  const allowedStatuses = ['ACTIVE', 'TRIAL', 'GRACE_PERIOD'];

  if (!subscription || !allowedStatuses.includes(subscription.status)) {
    return res.status(403).json({
      error: "Subscription Required",
      message: "Your access has been suspended due to an expired subscription or failed payment."
    });
  }

  next();
}