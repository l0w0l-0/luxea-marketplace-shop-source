# LUXEA Beauty Studio — Technical Debt & Improvement Opportunities

## 1. Critical Issues

### 1.1 Prisma Client Not Generated
**File:** `src/lib/db/prisma.ts`
**Issue:** Prisma client cannot be generated because `DIRECT_URL` environment variable is not set. The file has been commented out to fix the TypeScript error.
**Fix:** Set up `.env` with `DATABASE_URL` and `DIRECT_URL`, then run `npx prisma generate`.
**Impact:** Low — the app uses in-memory mock data and works without a database.

### 1.2 Duplicate Utility Code
**Files:** `src/utils/index.ts` and `src/shared/commerce.ts`
**Issue:** These two files contain nearly identical utility functions (formatMoney, formatOrderStatus, calculateCartTotals, etc.) with slightly different code styles.
**Fix:** Consolidate into a single source of truth. Remove `src/shared/commerce.ts` and update all imports to use `src/utils/index.ts`.
**Impact:** Medium — code duplication increases maintenance burden.

## 2. Architecture Improvements

### 2.1 State Management Scaling
**File:** `src/frontend/BeautyShopApp.tsx`
**Issue:** All application state (~20 state variables) is managed in a single component with `useState`. This makes the component ~527 lines long and difficult to maintain.
**Recommendation:** Split state into custom hooks:
- `useCart()` — cart state + addToCart, removeFromCart, updateQuantity
- `useAuth()` — user state + login, register, logout
- `useProducts()` — products, filtering, search
- `useOrders()` — orders, checkout logic
- `useAdmin()` — admin actions

### 2.2 No Context API or State Library
**Issue:** Props are passed through multiple component levels (prop drilling). For example, `renderStars` is passed from BeautyShopApp → ProductShelf → ProductCard.
**Recommendation:** Use React Context for shared dependencies like `renderStars`, or import the function directly where needed.

### 2.3 Mock Authentication
**File:** `src/frontend/BeautyShopApp.tsx` (lines 226-252)
**Issue:** Authentication is entirely mocked. Any email/password combination logs in successfully. Admin access is granted only to `admin@luxea.test` via environment variable.
**Recommendation:** Implement real authentication using Supabase Auth or NextAuth.js.

### 2.4 No Error Boundaries
**Issue:** The app has no React Error Boundaries. A runtime error in any component will crash the entire app.
**Recommendation:** Add a global Error Boundary component wrapping the main app.

### 2.5 No Loading States for Async Operations
**Issue:** The `checkout()` function is async but has no loading indicator. Users could click "ยืนยันคำสั่งซื้อ" multiple times.
**Recommendation:** Add a `isProcessing` state that disables the checkout button during async operations.

## 3. Code Quality Issues

### 3.1 Inline Product Data
**File:** `src/frontend/BeautyShopApp.tsx` (lines 56-122)
**Issue:** 6 product objects are hardcoded in the orchestrator component. This makes the file long and mixes data with logic.
**Recommendation:** Move `initialProducts` to `src/data/initialData.ts` and import it.

### 3.2 Inline Review Data
**File:** `src/frontend/BeautyShopApp.tsx` (lines 124-127)
**Issue:** Same as above — 2 review objects hardcoded.
**Recommendation:** Move to `src/data/initialData.ts`.

### 3.3 `any` Type Usage
**Files:** Multiple components
**Issue:** Several props use `any` type instead of specific types:
- `TopBar.tsx`: `setView: (value: any) => void`
- `HeroMall.tsx`: `setView: (v: any) => void`
- `QuickMenu.tsx`: `setView: (v: any) => void`
- `RightRail.tsx`: `setView: (v: any) => void`
- `AccountPanel.tsx`: `setView: (v: any) => void`
- `AdminPanel.tsx`: `setView: (v: any) => void`
**Fix:** Replace `any` with `AppView` type.

### 3.4 Inline Star Rating Logic
**Files:** `ProductDetail.tsx` (lines 108-115), `AdminPanel.tsx` (not used)
**Issue:** Star rating rendering logic is duplicated inline instead of using the shared `renderStars()` function from `StarRating.tsx`.
**Fix:** Replace inline star rendering with `renderStars(product.rating)`.

### 3.5 Category Icon Mapping Duplication
**Files:** `CheckoutPanel.tsx` (lines 325-335)
**Issue:** Category-to-emoji mapping is duplicated from `CATEGORY_ICONS` in constants.
**Fix:** Import and use `CATEGORY_ICONS` from constants instead of inline mapping.

## 4. Missing Features

### 4.1 Product Search Not Connected
**Issue:** The search bar in `TopBar` updates the `search` state, and `filteredProducts` uses it, but the "ค้นหา" button has no onClick handler.
**Fix:** Connect the search button or make search trigger on Enter key.

### 4.2 No Pagination
**Issue:** All products are displayed at once. With a large catalog, this would cause performance issues.
**Recommendation:** Add pagination or infinite scroll to `ProductShelf`.

### 4.3 No Image Upload
**Issue:** Product images use external URLs. There's no image upload functionality.
**Recommendation:** Add image upload to the admin panel.

### 4.4 No Order Tracking UI
**Issue:** Orders have `trackingNumber` and `trackingUrl` fields, but there's no UI to display or update them.
**Recommendation:** Add tracking info display in AccountPanel and edit in AdminPanel.

### 4.5 No Form Validation Library
**Issue:** Form validation is manual and minimal (checking for empty strings). Zod is declared as a dependency but not used.
**Recommendation:** Implement Zod schemas for checkout form, login form, and register form validation.

## 5. Performance Optimizations

### 5.1 Image Optimization
**Issue:** Images use external URLs with no Next.js Image optimization. The `next/image` component is not used.
**Recommendation:** Use Next.js `<Image>` component with proper width/height and placeholder blur.

### 5.2 Bundle Size
**Issue:** framer-motion is imported in multiple components. Consider tree-shaking or lazy-loading for views that aren't immediately visible.
**Recommendation:** Use dynamic imports for heavy components like `AdminPanel` and `BeautyStudio`.

### 5.3 Memoization
**Issue:** Some expensive computations in `AdminPanel.tsx` (filteredInventory, filteredOrders, etc.) use `useMemo`, but component re-renders could still be optimized.
**Recommendation:** Use `React.memo` for pure presentational components like `ProductCard`, `StatCard`, and `PromoCard`.

## 6. Accessibility Issues

### 6.1 Missing ARIA Labels
**Issue:** Several interactive elements lack proper ARIA labels:
- Color swatch buttons in ProductCard
- Quantity increment/decrement buttons
- Wishlist toggle buttons

### 6.2 Color Contrast
**Issue:** Some text may have insufficient contrast, particularly the secondary text on gradient backgrounds.

### 6.3 Keyboard Navigation
**Issue:** The app relies heavily on click handlers. Ensure all interactive elements are focusable and operable via keyboard.

## 7. Testing

### 7.1 No Unit Tests
**Issue:** There are no unit tests for utility functions, which are pure functions ideal for testing.
**Recommendation:** Add Jest tests for:
- `calculateCartTotals()`
- `calculateCartSummary()`
- `formatMoney()`
- `formatOrderStatus()`
- `isLowStock()`
- `calculateLoyaltyPoints()`

### 7.2 No Component Tests
**Issue:** No React Testing Library tests for components.
**Recommendation:** Add tests for critical user flows:
- Add to cart
- Apply coupon
- Checkout flow
- Admin stock update

## 8. Security

### 8.1 XSS Protection
**Issue:** `escapeHtml()` is used in `AdminPanel.tsx` for printing, but other user-generated content (reviews, comments) is rendered without sanitization.
**Recommendation:** Apply `escapeHtml()` to all user-generated content before rendering.

### 8.2 No Rate Limiting
**Issue:** The checkout and login functions have no rate limiting. A user could submit orders or login attempts rapidly.
**Recommendation:** Add client-side debouncing and server-side rate limiting.

## 9. Priority Matrix

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 🔴 High | Fix `any` types → `AppView` | Low | Medium |
| 🔴 High | Consolidate duplicate utils | Low | Medium |
| 🔴 High | Add loading state to checkout | Low | High |
| 🟡 Medium | Split state into custom hooks | Medium | High |
| 🟡 Medium | Move data to separate files | Low | Low |
| 🟡 Medium | Add Error Boundaries | Low | High |
| 🟢 Low | Add unit tests | Medium | Medium |
| 🟢 Low | Implement Zod validation | Medium | Medium |
| 🟢 Low | Add pagination | Medium | Low |
| 🟢 Low | Use next/image | Low | Low |