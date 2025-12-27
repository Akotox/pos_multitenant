# Walkthrough - Enhanced Inventory History Response

I've enhanced the inventory history API to include product information and use `id` instead of `_id`.

## Changes Made

### Stock Movement Model

#### [StockMovementModel.ts](file:///Volumes/Untitled/Projects/pos_multitenant/src/modules/inventory/infrastructure/database/models/StockMovementModel.ts)

Added `toJSON` transform to automatically convert `_id` to `id` and remove `__v`:

```typescript
{
    timestamps: true,
    toJSON: {
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
}
```

### Inventory Repository

#### [InventoryRepositoryImpl.ts](file:///Volumes/Untitled/Projects/pos_multitenant/src/modules/inventory/infrastructure/database/repositories/InventoryRepositoryImpl.ts)

Added product population to include basic product info:

```typescript
async getProductHistory(productId: string, tenantId: string): Promise<IStockMovement[]> {
    return await StockMovementModel.find({ productId, tenantId })
        .populate('productId', 'name sku barcode')
        .sort({ createdAt: -1 });
}
```

## Result

Now when you call `GET /api/v1/inventory/history/:productId`, you'll get:

```json
{
    "id": "694fa391cafb744bb6864a0c",
    "productId": {
        "id": "694f97bedc489c97d23a2233",
        "name": "Samsung Galaxy S24",
        "sku": "PRD-870983-4BI",
        "barcode": "8806095048017"
    },
    "tenantId": "694e9871d62062ceb6ee3d6a",
    "type": "ADJUSTMENT",
    "quantity": 20,
    "reason": "Manual stock adjustment via product update (+20)",
    "createdAt": "2025-12-27T09:14:57.686Z",
    "updatedAt": "2025-12-27T09:14:57.686Z"
}
```

**Key improvements:**
- `_id` → `id` for cleaner API
- `__v` removed from response
- `productId` now contains full product object with name, SKU, and barcode
