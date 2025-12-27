# SME Program Updates Walkthrough

I have successfully updated the SME Program page to target the Zimbabwean market with USD pricing and a functional domain search.

## Changes

### 1. Domain Search API
- Created `app/api/domain-check/route.ts` which uses DNS resolution to check if a domain is registered.
- Returns `available: true` if DNS resolution fails (implying the domain is not pointing anywhere), and `available: false` if it resolves.

### 2. Domain Search Component
- Updated `components/domain-search.tsx` to use the new API.
- Added a "Select" button for available domains to allow users to choose their domain.

### 3. Join SME Program Page
- **New Flow**:
    1.  **Domain**: Users start by searching for a domain.
    2.  **Details**: Users enter their company and contact details.
    3.  **Package**: Users define their website structure and select a package.
- **USD Pricing**:
    - Starter: $299
    - Professional: $599
    - Enterprise: Custom

## Verification Results

### Domain Search Flow
- The `DomainSearch` component now makes a POST request to `/api/domain-check`.
- If the domain is available, the user can click "Select", which updates the parent form state.
- The "Next Step" button in Step 1 allows proceeding to details.

### Pricing
- Packages now display USD prices as requested.

### Form Submission
- The final submission includes the selected domain, company details, website structure, and selected package.
