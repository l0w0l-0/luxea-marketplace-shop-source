# LUXEA Beauty Studio — Complete System Documentation

## 1. Architecture Overview

LUXEA Beauty Studio is a **Next.js 16** single-page application (SPA) for an e-commerce beauty marketplace. It uses **React 19** with **TypeScript** and **Tailwind CSS 4** for styling. All state is managed locally via React hooks in a single orchestrator component (`BeautyShopApp`). The app uses **framer-motion** for animations and **Prisma/Supabase** for a planned database layer (currently using in-memory mock data).

### Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 16 (App Router)             |
| UI Library  | React 19                            |
| Language    | TypeScript 5.9                      |
| Styling     | Tailwind CSS 4                      |
| Animation   | framer-motion 12                    |
| Validation  | Zod 4 (declared, not yet used)      |
| Database    | Prisma 7 + PostgreSQL (not active)  |
| Backend     | Supabase (declared, not yet used)   |

### Project Structure

```
beauty-studio/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Entry → renders BeautyShopApp
│   ├── globals.css               # Global + CSS variables + Tailwind
│   └── api/                      # Route handlers (image proxy)
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # DB migrations
├── supabase/
│   └── migrations/               # Supabase-specific migrations
├── src/
│   ├── backend/
│   │   └── store.ts              # In-memory database (fallback)
│   ├── components/
│   │   ├── common/               # Shared UI (StarRating, TextInput, PhoneInput)
│   │   ├── layout/               # TopBar, BottomNav, StatusStrip
│   │   └── features/             # Feature components by domain
│   │       ├── home/             # HeroMall, QuickMenu
│   │       ├── products/         # ProductCard, ProductVisual, ProductShelf, ProductDetail
│   │       ├── categories/       # CategoryChips, CategoryRail
│   │       ├── cart/             # CheckoutPanel, RightRail
│   │       ├── account/          # AccountPanel
│   │       ├── studio/           # BeautyStudio
│   │       └── admin/            # AdminPanel
│   ├── constants/                # Commerce config, admin tabs, UI constants
│   ├── data/                     # Seed data files
│   ├── frontend/                 # Main orchestrator: BeautyShopApp.tsx
│   ├── hooks/                    # Custom hooks (empty)
│   ├── lib/                      # Library modules (api, catalog, commerce, db, etc.)
│   ├── services/                 # Service layer (empty)
│   ├── shared/                   # Shared config & utilities (duplicate of utils)
│   ├── types/                    # All TypeScript interfaces & types
│   └── utils/                    # Utility functions (formatMoney, etc.)
```

## 2. State Management

All application state is managed in `BeautyShopApp.tsx` using:

- **`useState`** — All mutable state (products, cart, orders, user, wishlist, UI state)
- **`useMemo`** — Derived state (filtered products, cart summary, categories)
- **`useEffect`** — Side effects (loading screen, theme toggling, admin access guard, message timeout)

### State Variables

| Variable              | Type              | Purpose                          |
|-----------------------|-------------------|----------------------------------|
| `products`            | `Product[]`       | Product catalog                  |
| `cart`                | `CartItem[]`      | Shopping cart items              |
| `orders`              | `Order[]`         | Order history                    |
| `reviews`             | `Review[]`        | Product reviews                  |
| `user`                | `User \| null`    | Current logged-in user           |
| `wishlist`            | `string[]`        | Wishlist product IDs             |
| `stockMovements`      | `StockMovement[]` | Stock change audit trail         |
| `storeSettings`       | `StoreSettings`   | Store configuration              |
| `view`                | `AppView`         | Current screen (home/shop/etc.)  |
| `selectedProduct`     | `Product \| null` | Product being viewed in detail   |
| `search`              | `string`          | Search query                     |
| `category`            | `string`          | Selected category filter         |
| `coupon`              | `Coupon \| null`  | Applied coupon                   |
| `message`             | `string`          | Toast/notification message       |
| `checkoutForm`        | object            | Shipping form fields             |
| `loginForm`           | object            | Login form fields                |
| `registerForm`        | object            | Registration form fields         |
| `paymentMethod`       | string            | Selected payment method          |

## 3. View / Navigation System

Navigation is controlled by the `view` state (`AppView` type):

| View               | Route/Trigger              | Components Rendered                 |
|--------------------|----------------------------|-------------------------------------|
| `"home"`           | Default / Logo click       | HeroMall, CategoryChips, QuickMenu, ProductShelf, RightRail |
| `"shop"`           | "ช้อป rosy picks" button   | CategoryRail, CategoryChips, ProductShelf, RightRail |
| `"product-detail"` | Click product card         | ProductDetail (full page)           |
| `"studio"`         | Bottom nav / QuickMenu     | BeautyStudio                        |
| `"wishlist"`       | Heart icon / Bottom nav    | ProductCard grid (filtered)         |
| `"checkout"`       | Cart button / Bottom nav   | CheckoutPanel                       |
| `"account"`        | Profile / Bottom nav       | AccountPanel (login/register/profile)|
| `"admin"`          | Admin button in Account    | AdminPanel (8 tabs)                 |

## 4. Data Flow

```
User Action → View Component → Callback → BeautyShopApp handler → State Update → Re-render
```

Example flow for "Add to Cart":
1. User clicks "Add to Cart" on `ProductCard`
2. `ProductCard` calls `onAddToCart(product, colorId)`
3. `BeautyShopApp.addToCart()`:
   - Checks stock availability
   - Finds or creates cart entry
   - Updates `cart` state via `setCart`
   - Sets `message` for success notification

## 5. Business Rules

### Cart Rules
- Items keyed by `(productId, colorId)` tuple
- Duplicate add → increment quantity (capped at stock)
- Quantity min=1, max=stock
- Empty cart shows "ตะกร้ายังว่าง" message

### Checkout Rules
- Requires logged-in user
- Requires complete shipping info (name, phone, address)
- Validates stock before creating order
- If stock changed → adjusts cart quantities and returns to checkout
- Creates `Order`, deducts stock, creates `StockMovement` records
- Clears cart and coupon after success

### Coupon Rules
| Code      | Kind        | Effect                          |
|-----------|-------------|----------------------------------|
| `LUXEA10` | percent10   | 10% off subtotal, max 200฿      |
| `FREESHIP`| freeship    | Waives shipping fee              |

### Payment Methods
| Method             | Order Status          |
|--------------------|-----------------------|
| Credit Card        | `paid` (immediate)    |
| Bank Transfer      | `waiting_payment`     |
| Cash On Delivery   | `cod`                 |

### Order Status Flow
```
waiting_payment → paid → processing → shipped → completed
                               ↘ cancelled (any state)
```
COD orders skip `waiting_payment` and start at `cod`.

### Shipping Rules
- Default fee: 50฿
- Free when subtotal ≥ 699฿
- Free when coupon FREESHIP applied
- Shipping = 0 when cart is empty

### Loyalty Points
- 1 point per 100฿ spent
- VIP tier shows gold badge in UI
- Points display in account panel

### Auth (Mock)
- No real authentication
- `admin@luxea.test` → admin role (when `NEXT_PUBLIC_ENABLE_DEMO_ADMIN=true`)
- Any other login → customer role
- Registration creates a mock user

### Admin Access
- Guarded by `useEffect`: non-admin users redirected to home
- Admin tab shows when `user.role === "admin"`
- 8 tabs: dashboard, products, inventory, orders, customers, reviews, reports, settings

## 6. Image Handling

- External images proxied through `/api/image?url=...` (CORS prevention)
- `normalizeImageUrl()` fixes "text-to-image" → "text_to_image" in URLs
- Images have `onError` fallback that hides broken images
- ProductVisual uses gradient overlay + image

## 7. Responsive Design

| Breakpoint | Behavior                                 |
|------------|------------------------------------------|
| Mobile     | BottomNav visible, QuickMenu shown       |
| Tablet+    | TopBar full, Sidebar rails shown         |
| Desktop    | 3-column layout (sidebar + content + rail)|

## 8. Admin Panel Features

| Tab         | Features                                                      |
|-------------|---------------------------------------------------------------|
| Dashboard   | Overview stats (product count, orders, low stock, cart value) |
| Products    | Search, edit product fields, status/tags                      |
| Inventory   | Search, low-stock filter, per-product stock adjustment        |
| Orders      | Search, filter by status, CSV export, click for detail        |
| Customers   | List with order count, total spent (sorted by spend)          |
| Reviews     | Search, filter by status (approved/pending)                   |
| Reports     | CSV export, printable receipts, shipping labels               |
| Settings    | Free shipping threshold, shipping fee, low stock threshold, payment methods |

## 9. Key Dependencies

| Package          | Version | Purpose                        |
|------------------|---------|--------------------------------|
| next             | ^16     | Framework                      |
| react            | ^19     | UI library                     |
| framer-motion    | ^12     | Animations                     |
| @prisma/client   | ^7      | ORM (planned)                  |
| @prisma/adapter-pg| ^7     | PostgreSQL adapter             |
| @supabase/supabase-js| ^2  | Supabase client (planned)      |
| zod              | ^4      | Validation (planned)           |
| tailwindcss      | ^4      | CSS framework                  |