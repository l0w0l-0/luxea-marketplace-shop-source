# LUXEA Beauty Studio — Developer Guide

## 1. Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Setup
```bash
cd beauty-studio
npm install
npm run dev
```

The app will start at `http://localhost:3000`.

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # TypeScript type checking
```

## 2. Code Organization Conventions

### Component Structure
```
src/components/
├── common/       # Reusable UI primitives (no business logic)
├── layout/       # App shell components (header, nav, footer)
└── features/     # Feature-specific components organized by domain
    ├── home/     # Home page components
    ├── products/ # Product-related components
    ├── cart/     # Cart & checkout components
    ├── account/  # User account components
    ├── studio/   # Beauty studio feature
    └── admin/    # Admin panel
```

### Naming Conventions
- **Files:** PascalCase for components (`ProductCard.tsx`), camelCase for utilities (`formatMoney.ts`)
- **Components:** PascalCase, exported as named functions
- **Functions:** camelCase
- **Types/Interfaces:** PascalCase
- **Constants:** UPPER_SNAKE_CASE for config, camelCase for UI constants

### Import Order
1. React / Next.js imports
2. Third-party libraries (framer-motion, etc.)
3. Internal types (`@/src/types`)
4. Internal constants (`@/src/constants`)
5. Internal utilities (`@/src/utils`)
6. Internal components (`@/src/components/...`)

## 3. How to Add a New Feature

### Step 1: Define Types (if needed)
Add new interfaces/types to `src/types/index.ts`.

### Step 2: Add Constants (if needed)
Add new constants to `src/constants/index.ts`.

### Step 3: Create Component
Create a new file in the appropriate feature directory:
```
src/components/features/<feature-name>/YourComponent.tsx
```

### Step 4: Add View (if new page)
1. Add new value to `AppView` type in `src/types/index.ts`
2. Add rendering block in `BeautyShopApp.tsx`:
```tsx
{view === "your-new-view" && <YourComponent ... />}
```

### Step 5: Add Navigation
Add button/link in `TopBar`, `BottomNav`, or `QuickMenu` that calls `setView("your-new-view")`.

### Step 6: Add State & Actions
Add state variables and handler functions in `BeautyShopApp.tsx`.

## 4. How to Add a New Product

Add a new product object to the `initialProducts` array in `BeautyShopApp.tsx`:

```typescript
{
  id: "your-product-id",
  name: "Product Name",
  category: "Lipstick", // Must match existing category or add new
  shade: "Shade Name",
  price: 299,
  stock: 20,
  rating: 4.5,
  reviewCount: 10,
  color: "#HEXCODE",
  description: "Product description in Thai",
  image: "https://...",
  colors: [
    {
      id: "color-id",
      name: "Color Name",
      hex: "#HEXCODE",
      undertone: "Cool", // Cool | Warm | Neutral
      finish: "Matte",   // Matte | Satin | Shimmer | Glossy
      stock: 20,
    },
  ],
  tags: ["New"], // "Premium" | "New" | "Best Seller"
}
```

## 5. How to Add a New Category

1. Add the category name to the product's `category` field
2. Add an emoji icon in `CATEGORY_ICONS` in `src/constants/index.ts`
3. The category will automatically appear in `CategoryChips` and `CategoryRail`

## 6. How to Add a New Coupon

1. Add new type to `Coupon` union in `src/types/index.ts`
2. Add coupon logic in `applyCoupon()` in `BeautyShopApp.tsx`
3. Update `calculateCartSummary()` in `src/utils/index.ts` to handle the new coupon kind

## 7. How to Add a New Admin Tab

1. Add new tab object to `ADMIN_TABS` in `src/constants/index.ts`
2. Add rendering block in `AdminPanel.tsx`:
```tsx
{tab === "your-tab-id" && (
  <div className="glass-xl p-8">
    <h2>Your Tab Content</h2>
  </div>
)}
```

## 8. Testing

### Manual Testing Checklist
- [ ] All 8 views render correctly (home, shop, product-detail, studio, wishlist, checkout, account, admin)
- [ ] Add to cart works with color selection
- [ ] Cart quantity update works
- [ ] Coupon codes apply correctly
- [ ] Checkout flow completes (login → fill form → pay → order created)
- [ ] Admin panel tabs all render
- [ ] Stock updates reflect in admin
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Search filters products
- [ ] Category filtering works
- [ ] Wishlist toggle works

### Type Checking
```bash
npx tsc --noEmit
```
Should exit with zero errors.

## 9. Environment Variables

| Variable                          | Purpose                          | Required |
|-----------------------------------|----------------------------------|----------|
| `NEXT_PUBLIC_ENABLE_DEMO_ADMIN`   | Enable admin@luxea.test login    | No       |
| `DATABASE_URL`                    | PostgreSQL connection (Prisma)   | No*      |
| `DIRECT_URL`                      | Direct DB connection (Prisma)    | No*      |

*Required only if using Prisma/Supabase backend.

## 10. Common Tasks

### Add a new payment method
1. Add to `PAYMENT_METHODS` in `src/constants/index.ts`
2. Add to `enabledPaymentMethods` in `DEFAULT_STORE_SETTINGS`
3. Add payment meta in `CheckoutPanel.tsx` `paymentMeta()` function
4. Add order status mapping in `checkout()` in `BeautyShopApp.tsx`

### Modify shipping rules
Update `COMMERCE_CONFIG.freeShippingThreshold` and `COMMERCE_CONFIG.shippingFee` in `src/constants/index.ts`.

### Change low stock threshold
Update `COMMERCE_CONFIG.lowStockThreshold` in `src/constants/index.ts`.

### Add a new product tag
1. Add to the `tags` array type in `Product` interface in `src/types/index.ts`
2. Add badge rendering logic in `ProductCard.tsx` `badges()` function