# API Routes Documentation

## Authentication
Base URL: `/api/auth`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new tenant/user. | Public (or Owner/Manager if creating user in existing tenant) |
| POST | `/login` | Authenticate user and get token. | Public |

## Payments & Subscriptions
Base URL: `/api/payments`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/subscription` | Get current subscription status. | Authenticated |
| POST | `/renew` | Manually renew/simulate subscription. | Owner |

## Categories
Base URL: `/api/categories`
*Requires active subscription*

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | List all categories. | Authenticated |
| GET | `/:id` | Get category details. | Authenticated |
| POST | `/` | Create a new category. | Owner, Manager |
| PUT | `/:id` | Update a category. | Owner, Manager |
| DELETE | `/:id` | Delete a category. | Owner, Manager |

## Products
Base URL: `/api/products`
*Requires active subscription*

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | List all products. | Authenticated |
| GET | `/:id` | Get product details. | Authenticated |
| POST | `/` | Create a new product. | Owner, Manager |
| PUT | `/:id` | Update a product. | Owner, Manager |
| DELETE | `/:id` | Delete a product. | Owner, Manager |

## Inventory
Base URL: `/api/inventory`
*Requires active subscription*

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/history/:productId` | View stock history for a product. | Owner, Manager |
| POST | `/adjust` | Manually adjust stock levels. | Owner, Manager |

## Customers
Base URL: `/api/customers`
*Requires active subscription*

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | List all customers (with search). | Authenticated |
| GET | `/:id` | Get customer details. | Authenticated |
| POST | `/` | Create a new customer. | Authenticated |
| PUT | `/:id` | Update a customer. | Authenticated |
| DELETE | `/:id` | Delete a customer. | Owner, Manager |

## Sales
Base URL: `/api/sales`
*Requires active subscription*

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | List all sales. | Authenticated |
| GET | `/:id` | Get sale details. | Authenticated |
| POST | `/` | Process a new sale (order). | Authenticated |

## Reports
Base URL: `/api/reports`
*Requires active subscription*

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/dashboard` | Daily sales, profit stats, and alerts. | Owner, Manager |
| GET | `/advanced` | Top customers and sales heatmap. | Owner, Manager |
| GET | `/daily-sales` | Get daily sales summary. | Owner, Manager |
| GET | `/product-performance` | Get sales performance by product. | Owner, Manager |
