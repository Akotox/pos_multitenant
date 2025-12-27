# Admin & Pricing Modules

This document describes the comprehensive Admin and Pricing modules for the multi-tenant POS system.

## 🏗️ Architecture Overview

### Admin Module
- **Domain**: Admin entities, roles, permissions
- **Application**: Admin business logic, tenant/user management
- **Infrastructure**: Admin models, repositories
- **Interfaces**: Controllers, routes, middleware

### Pricing Module
- **Domain**: Pricing plans, subscriptions, payments
- **Application**: Subscription management, usage tracking
- **Infrastructure**: Pricing models, Stripe integration
- **Interfaces**: Controllers, routes, webhooks

## 👑 Admin Module Features

### Admin Roles & Permissions
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Tenant and user management
- **BILLING_ADMIN**: Billing and subscription management
- **SUPPORT**: Customer support tools

### Key Features
- ✅ Multi-level admin authentication
- ✅ Role-based permission system
- ✅ Tenant management and oversight
- ✅ User management across all tenants
- ✅ Global analytics and reporting
- ✅ System monitoring and maintenance

### Admin Endpoints

#### Authentication
```
POST /api/v1/admin/login
```

#### Admin Management
```
GET    /api/v1/admin/              # List all admins
POST   /api/v1/admin/              # Create new admin
GET    /api/v1/admin/:id           # Get admin by ID
PUT    /api/v1/admin/:id           # Update admin
DELETE /api/v1/admin/:id           # Delete admin
PUT    /api/v1/admin/:id/password  # Change password
```

#### Tenant Management
```
GET /api/v1/admin/tenants/list     # List all tenants
GET /api/v1/admin/tenants/:id      # Get tenant details
PUT /api/v1/admin/tenants/:id      # Update tenant
PUT /api/v1/admin/tenants/:id/suspend   # Suspend tenant
PUT /api/v1/admin/tenants/:id/activate  # Activate tenant
```

#### User Management
```
GET /api/v1/admin/users/list       # List all users
GET /api/v1/admin/users/:id        # Get user details
PUT /api/v1/admin/users/:id        # Update user
PUT /api/v1/admin/users/:id/reset-password  # Reset password
```

#### Analytics
```
GET /api/v1/admin/dashboard/stats           # Global dashboard
GET /api/v1/admin/analytics/tenant/:id     # Tenant analytics
```

## 💰 Pricing Module Features

### Pricing Plans
- **Starter**: $29/month - Basic features for small businesses
- **Professional**: $79/month - Advanced features for growing businesses
- **Enterprise**: $199/month - Full features for large businesses
- **Annual Plans**: 2 months free with yearly billing

### Subscription Management
- ✅ Stripe integration for payments
- ✅ Usage-based billing and limits
- ✅ Automatic subscription renewals
- ✅ Prorated upgrades/downgrades
- ✅ Trial periods support
- ✅ Billing portal integration

### Usage Limits & Features
| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Users | 2 | 10 | 100 |
| Products | 500 | 5,000 | 50,000 |
| Sales/Month | 1,000 | 10,000 | 100,000 |
| Storage | 1GB | 10GB | 100GB |
| API Calls | 0 | 10,000 | 100,000 |
| Support | Email | Email + Chat | Phone + Dedicated |
| Multi-location | ❌ | ✅ (3 locations) | ✅ (Unlimited) |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Custom Reports | ❌ | ✅ | ✅ |

### Pricing Endpoints

#### Public Plans
```
GET /api/v1/pricing/plans          # List all active plans
GET /api/v1/pricing/plans/:id      # Get plan details
```

#### Admin Plan Management
```
POST   /api/v1/pricing/admin/plans     # Create plan
PUT    /api/v1/pricing/admin/plans/:id # Update plan
DELETE /api/v1/pricing/admin/plans/:id # Delete plan
```

#### Subscription Management
```
POST /api/v1/pricing/subscription         # Create subscription
GET  /api/v1/pricing/subscription         # Get current subscription
PUT  /api/v1/pricing/subscription         # Update subscription
POST /api/v1/pricing/subscription/cancel  # Cancel subscription
POST /api/v1/pricing/subscription/reactivate # Reactivate
```

#### Usage & Billing
```
GET  /api/v1/pricing/usage               # Get usage metrics
GET  /api/v1/pricing/usage/limits        # Check usage limits
GET  /api/v1/pricing/billing/history     # Payment history
POST /api/v1/pricing/billing/portal      # Billing portal session
```

#### Webhooks
```
POST /api/v1/pricing/webhooks/stripe     # Stripe webhook handler
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install bcrypt stripe express-validator
npm install -D @types/bcrypt
```

### 2. Environment Variables
Add to your `.env` file:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Admin Configuration
ADMIN_JWT_SECRET=your_super_secret_admin_jwt_key
ADMIN_JWT_EXPIRES_IN=24h
```

### 3. Database Seeding
```bash
# Seed everything
npm run seed

# Or seed individually
npm run seed:admin
npm run seed:pricing
```

### 4. Default Admin Credentials
After seeding, use these credentials:
- **Email**: admin@posystem.com
- **Password**: SuperAdmin123!
- ⚠️ **Change password after first login!**

### 5. Stripe Setup
1. Create a Stripe account
2. Get your API keys from Stripe Dashboard
3. Create webhook endpoint: `https://yourdomain.com/api/v1/pricing/webhooks/stripe`
4. Subscribe to these events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 🔒 Security Features

### Admin Security
- JWT-based authentication with role verification
- Permission-based access control
- Password hashing with bcrypt
- Secure admin session management

### Payment Security
- Stripe PCI compliance
- Webhook signature verification
- Secure payment processing
- No sensitive payment data stored locally

## 📊 Usage Monitoring

### Automatic Usage Tracking
The system automatically tracks:
- Active user count per tenant
- Product count per tenant
- Monthly sales volume
- Storage usage
- API call counts

### Limit Enforcement
Middleware automatically enforces limits:
```typescript
// Check user limits before creating users
router.post('/users', checkSubscriptionLimits('users'), createUser);

// Check product limits before creating products
router.post('/products', checkSubscriptionLimits('products'), createProduct);

// Require active subscription for premium features
router.get('/advanced-analytics', requireActiveSubscription, getAnalytics);

// Check feature access
router.get('/multi-location', checkFeatureAccess('multiLocation'), getLocations);
```

## 🔄 Subscription Lifecycle

### 1. Trial Period
- New tenants get 14-day free trial
- Full access to Professional features
- Automatic conversion to paid plan

### 2. Active Subscription
- Monthly/yearly billing cycles
- Automatic renewals
- Usage monitoring and alerts

### 3. Payment Issues
- Automatic retry for failed payments
- Grace period before suspension
- Email notifications to tenant

### 4. Cancellation
- Immediate or end-of-period cancellation
- Data retention period
- Easy reactivation process

## 🛠️ Development Tools

### Admin CLI Commands
```bash
# Create super admin
npm run seed:admin

# Sync pricing plans with Stripe
npm run sync:stripe

# Generate usage reports
npm run reports:usage
```

### Testing
```bash
# Test admin authentication
curl -X POST http://localhost:3000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@posystem.com","password":"SuperAdmin123!"}'

# Test subscription creation
curl -X POST http://localhost:3000/api/v1/pricing/subscription \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"PLAN_ID","trialDays":14}'
```

## 📈 Monitoring & Analytics

### Admin Dashboard Metrics
- Total tenants (active/inactive)
- Total users across all tenants
- Revenue metrics (MRR, ARR)
- Subscription distribution
- Usage statistics

### Tenant Analytics
- Individual tenant performance
- Usage vs. limits
- Payment history
- Feature utilization

## 🔧 Customization

### Adding New Admin Roles
1. Update `AdminRole` enum
2. Define permissions in `ROLE_PERMISSIONS`
3. Update middleware and validation

### Adding New Pricing Plans
1. Create plan via admin API
2. Configure features and limits
3. Sync with Stripe
4. Update frontend pricing page

### Custom Usage Metrics
1. Extend `UsageMetrics` interface
2. Update tracking logic
3. Add limit enforcement
4. Update billing calculations

## 🚨 Important Notes

1. **Security**: Always use HTTPS in production
2. **Webhooks**: Verify Stripe webhook signatures
3. **Backups**: Regular database backups for billing data
4. **Monitoring**: Set up alerts for payment failures
5. **Compliance**: Ensure PCI compliance for payment processing
6. **Testing**: Test subscription flows thoroughly
7. **Documentation**: Keep API documentation updated

## 📞 Support

For issues with the admin or pricing modules:
1. Check logs for detailed error messages
2. Verify environment variables
3. Test Stripe webhook connectivity
4. Review subscription status in Stripe dashboard
5. Contact development team with specific error details