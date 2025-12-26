# Frontend Implementation Plan - Multi-Tenant POS (Flutter)

This document outlines the plan to build a sleek, modern, multi-tenant POS application using **Flutter**, adhering to **Clean Architecture** and **Test-Driven Development (TDD)** principles.

## 1. Technological Stack

| Category | Package/Service | Purpose |
| :--- | :--- | :--- |
| **Language** | Dart | Type-safe, compiled language. |
| **Framework** | Flutter | Cross-platform UI (Android, Tablet, iOS). |
| **State Management** | `flutter_bloc`, `equatable` | Predictable state, easy to test. |
| **Dependency Injection** | `get_it`, `injectable` | Decoupling dependencies. |
| **Networking** | `dio` | HTTP client with interceptors (Auth token). |
| **Navigation** | `go_router` | Declarative routing, deep linking. |
| **Storage** | `flutter_secure_storage` | Securely storing JWT tokens. |
| **UI Components** | `google_fonts`, `flutter_svg` | Modern typography and icons. |
| **Theming** | `flex_color_scheme` | Beautiful, sleek color themes out-of-the-box. |
| **Charts** | `fl_chart` | Analytical graphs for reports. |
| **Testing** | `mocktail`, `bloc_test`, `flutter_test` | Unit and Widget testing. |

---

## 2. Architecture: Clean Architecture + TDD

The project will be structured by **Features**, with each feature containing three layers:

```
lib/
├── core/                   # Shared logic (Errors, Network, Utils, Strings)
├── config/                 # Routes, Themes, DI setup
├── features/
│   ├── auth/
│   │   ├── data/           # Models, DataSources (API), Repositories Impl
│   │   ├── domain/         # Entities, Repository Interfaces, UseCases
│   │   └── presentation/   # BLoCs, Pages, Widgets
│   ├── pos/
│   ├── inventory/
│   └── ...
└── main.dart
```

### TDD Workflow
For every feature (e.g., "Login"):
1.  **Domain**: Define `Entity` and `Repository Interface`.
2.  **UseCase Test**: Write a failing test for `LoginUseCase`.
3.  **UseCase Impl**: Implement the UseCase to pass the test.
4.  **Data Test**: Write failing tests for `AuthRepositoryImpl` and `AuthRemoteDataSource`.
5.  **Data Impl**: Implement the repository and data source.
6.  **Presentation Test**: Write tests for `AuthBloc`.
7.  **Presentation Impl**: Build the UI.

---

## 3. UI/UX Strategy (Sleek & Adaptive)

The app must look premium and work seamlessly on **Android Phones** (Portrait) and **Tablets** (Landscape).

### Adaptive Shell
-   **Phone**: Standard `BottomNavigationBar` with 4-5 tabs.
-   **Tablet**: Persistent `NavigationRail` or `NavigationDrawer` on the left.

### Theming
-   **Font**: *Poppins* or *Inter* for clean readability.
-   **Colors**: A "Midnight & Neon" or "Deep Ocean" theme using `flex_color_scheme`.
-   **Interactions**: Smooth animations (Hero transitions between Product List and Detail).

---

## 4. Feature Implementation Details

### Module 1: Authentication & Setup
*Use TDD to implement the foundation.*
-   **Features**:
    -   **Login**: Email/Password. Decodes JWT to extract `role` (OWNER, MANAGER, CASHIER) and `tenantId`.
    -   **Register**: Multi-step form (Company Info -> User Info).
    -   **Splash Screen**: Checks valid token/subscription status on startup.
-   **RBAC**:
    -   Store `UserRole` in a singleton `AuthCubit` accessible globally.

### Module 2: Dashboard (Home)
-   **Layout**:
    -   **Tablet**: 3-column grid of overview cards.
    -   **Phone**: Vertical list of cards.
-   **Widgets**:
    -   `SalesSummaryCard`: "Today's Sales: $X" (Hidden for Cashier?).
    -   `LowStockWidget`: Horizontal list of items with low stock.
    -   `QuickActions`: Buttons for "New Sale", "Add Product".

### Module 3: Point of Sale (POS) - *Core Feature*
*Needs to be extremely fast and responsive.*
-   **Tablet Layout (Split Screen)**:
    -   **Left (65%)**: Product Grid. Category Tabs on top. Search bar.
    -   **Right (35%)**: "Ticket" (Cart). List of added items, Tax, Total, "Charge" button.
-   **Phone Layout**:
    -   Full-screen Product List.
    -   Floating Action Button (FAB) showing "Items: 3 | $45.00".
    -   Tapping FAB opens "Cart" BottomSheet or full screen.
-   **Logic**:
    -   Real-time stock check (optimistic UI).
    -   Offline capability (optional future scope, but keep architecture ready).

### Module 4: Inventory Management
-   **List View**: Infinite scroll list of products.
-   **Detail View**: Stock history chart.
-   **Actions**:
    -   **Add/Edit**: Forms with validation. *Disabled for CASHIER*.
    -   **Adjust Stock**: Special dialog to add/remove stock with reason. *Disabled for CASHIER*.

### Module 5: Reports & Analytics
*Strictly for OWNER and MANAGER.*
-   **Components**:
    -   `DailySalesChart`: Line chart of last 7/30 days. (API: `/reports/daily-sales`)
    -   `TopProductsList`: List of best sellers.
    -   `Heatmap`: Visual grid of peak sales hours (API: `/reports/advanced`).
-   **RBAC**: Entire module hidden from CASHIER.

### Module 6: Customers
-   **Lookups**: Search bar to find customer by phone during a sale.
-   **Management**: Add new customer (Modal). View customer purchase history.

### Module 7: Subscription & Settings
-   **Profile**: Change password/name.
-   **Subscription**:
    -   Display "Active" until `endDate`.
    -   **Renew Button**: Visible only to **OWNER**. Calls `/payments/renew`.

---

## 5. Development Roadmap

1.  **Skeleton**: Project setup, themes, routes, dependency injection.
2.  **Auth Layer**: Data sources, Repositories, BLoCs for Login/Register.
3.  **Core POS**: Product fetching, Cart logic (local state), Order submission.
4.  **Inventory & Customers**: CRUD operations.
5.  **Analytics**: Charts and Dashboards.
6.  **Polish**: Animations, error handling, responsive testing on Tablet emulator.

