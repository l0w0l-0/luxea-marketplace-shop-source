# LUXEA Beauty Studio — API Reference

## 1. Type Definitions (`src/types/index.ts`)

### ProductColor
```typescript
interface ProductColor {
  id: string;
  name: string;
  hex: string;
  undertone?: string;
  finish?: string;
  coverage?: string;
  stock: number;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  shade: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  color: string;
  description: string;
  image: string;
  colors: ProductColor[];
  isPremium?: boolean;
  status?: "draft" | "published";
  tags?: Array<"Premium" | "New" | "Best Seller">;
  sortOrder?: number;
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  tier: "Member" | "VIP";
  points: number;
}
```

### CartItem
```typescript
interface CartItem {
  productId: string;
  colorId: string;
  quantity: number;
}
```

### Order
```typescript
type OrderStatus =
  | "paid" | "waiting_payment" | "cod"
  | "processing" | "shipped" | "completed" | "cancelled";

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    productId: string;
    colorId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingMethod: "standard";
  trackingNumber?: string;
  trackingUrl?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
}
```

### Review
```typescript
interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  skinTone?: string;
  createdAt: string;
  status?: "approved" | "pending" | "hidden";
}
```

### Coupon
```typescript
type Coupon =
  | { code: "LUXEA10"; kind: "percent10" }
  | { code: "FREESHIP"; kind: "freeship" };
```

### StoreSettings
```typescript
interface StoreSettings {
  freeShippingThreshold: number;
  shippingFee: number;
  lowStockThreshold: number;
  enabledPaymentMethods: Array<
    "Credit Card" | "Bank Transfer" | "Cash On Delivery"
  >;
}
```

### StockMovement
```typescript
interface StockMovement {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  colorId?: string;
  colorName?: string;
  delta: number;
  reason: "manual_adjust" | "order_checkout";
  actor: string;
  note?: string;
}
```

### AppView
```typescript
type AppView =
  | "home" | "studio" | "shop" | "wishlist"
  | "account" | "admin" | "checkout" | "product-detail";
```

### PaymentMethod
```typescript
type PaymentMethod = "Credit Card" | "Bank Transfer" | "Cash On Delivery";
```

---

## 2. Constants (`src/constants/index.ts`)

### COMMERCE_CONFIG
```typescript
const COMMERCE_CONFIG = {
  freeShippingThreshold: 699,      // ฿ — free shipping minimum
  shippingFee: 50,                  // ฿ — default shipping fee
  loyaltyPointUnitBaht: 100,       // points per ฿100 spent
  lowStockThreshold: 10,           // stock count for "low stock" warning
} as const;
```

### CATEGORY_ICONS
```typescript
const CATEGORY_ICONS: Record<string, string> = {
  ทั้งหมด: "🛒",
  Lipstick: "💄",
  Blush: "🌸",
  Highlighter: "✨",
  Foundation: "🧴",
  Skincare: "🧖‍♀️",
  Eyeshadow: "🎨",
  Eye: "👁️",
  Setting: "💨",
  Face: "🧴",
  Tools: "🖌",
};
```

### PAYMENT_METHODS
```typescript
const PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "Cash On Delivery",
] as const;
```

### DEFAULT_STORE_SETTINGS
```typescript
const DEFAULT_STORE_SETTINGS = {
  freeShippingThreshold: 699,
  shippingFee: 50,
  lowStockThreshold: 10,
  enabledPaymentMethods: ["Credit Card", "Bank Transfer", "Cash On Delivery"],
};
```

### DEMO_ADMIN_EMAIL
```typescript
const DEMO_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_ADMIN === "true"
    ? "admin@luxea.test"
    : null;
```

### UI Constants
```typescript
const MESSAGE_DURATION = 2600;   // ms — auto-dismiss notification
const LOADING_DURATION = 2500;   // ms — initial loading screen
```

### ADMIN_TABS
```typescript
const ADMIN_TABS = [
  { id: "dashboard",  label: "Control Center", eyebrow: "Overview",     icon: "◈" },
  { id: "products",   label: "Products",        eyebrow: "Catalog",     icon: "✦" },
  { id: "inventory",  label: "Inventory",       eyebrow: "Stock",       icon: "◌" },
  { id: "orders",     label: "Orders",          eyebrow: "Fulfillment", icon: "→" },
  { id: "customers",  label: "Customers",       eyebrow: "CRM",         icon: "◎" },
  { id: "reviews",    label: "Reviews",         eyebrow: "Content",     icon: "✳" },
  { id: "reports",    label: "Reports",         eyebrow: "Revenue",     icon: "◫" },
  { id: "settings",   label: "Settings",        eyebrow: "System",      icon: "⋯" },
] as const;

type AdminTabId = (typeof ADMIN_TABS)[number]["id"];
```

---

## 3. Utility Functions (`src/utils/index.ts`)

### formatMoney(amount: number): string
Formats a number as Thai Baht currency string.
```typescript
formatMoney(1299) // → "฿1,299"
```

### formatOrderStatus(status): string
Maps OrderStatus enum to Thai label.
```typescript
formatOrderStatus("waiting_payment") // → "รอชำระ"
formatOrderStatus("paid")            // → "ชำระแล้ว"
formatOrderStatus("cod")             // → "ปลายทาง"
formatOrderStatus("processing")      // → "กำลังเตรียมของ"
formatOrderStatus("shipped")         // → "จัดส่งแล้ว"
formatOrderStatus("completed")       // → "สำเร็จ"
formatOrderStatus("cancelled")       // → "ยกเลิก"
```

### normalizeImageUrl(url: string): string
Normalizes "text-to-image" to "text_to_image" in URLs.
```typescript
normalizeImageUrl("...text-to-image...") // → "...text_to_image..."
```

### getImageSrc(url: string): string
Returns a proxied image URL for external images.
- Relative paths returned as-is
- Non-HTTP URLs returned as-is
- HTTPS URLs wrapped in `/api/image?url=...`

### downloadTextFile(filename, content, mime): void
Triggers a browser file download.

### escapeHtml(value: string): string
Escapes HTML special characters to prevent XSS.
```typescript
escapeHtml("<script>alert('xss')</script>")
// → "<script>alert(&#039;xss&#039;)</script>"
```

### calculateCartTotals(args): CartTotals
Calculates subtotal, discount, shipping, and total.
```typescript
calculateCartTotals({
  items: [{ unitPrice: 299, quantity: 2 }],
  discount: 0,
  freeShippingThreshold: 699,
  shippingFee: 50,
})
// → { itemCount: 2, subtotal: 598, discount: 0, shipping: 50, total: 648 }
```

### calculateCartSummary(args): CartSummary
Full cart summary with coupon logic.
```typescript
calculateCartSummary({
  cart: [{ productId: "lip-1", colorId: "rosy", quantity: 1 }],
  products: [{ id: "lip-1", price: 299 }],
  coupon: { code: "LUXEA10", kind: "percent10" },
  settings: { freeShippingThreshold: 699, shippingFee: 50 },
})
// → { quantity: 1, total: 299, discount: 29, shipping: 50, grandTotal: 320 }
```

### calculateLoyaltyPoints(orderTotal, unit?): number
```typescript
calculateLoyaltyPoints(1299, 100) // → 12
```

### isLowStock(stockQty, threshold?): boolean
```typescript
isLowStock(5, 10)  // → true
isLowStock(15, 10) // → false
```

### calculateAvailableQuantity(stockQty, reservedQty?): number
```typescript
calculateAvailableQuantity(20, 3) // → 17
```

---

## 4. Store Actions (BeautyShopApp Handlers)

| Action                     | Signature                                      | Description                          |
|----------------------------|------------------------------------------------|--------------------------------------|
| `addToCart`                | `(product: Product, colorId: string) => void`  | Add item to cart (or increment)      |
| `toggleWishlist`           | `(productId: string) => void`                  | Add/remove from wishlist             |
| `applyCoupon`              | `() => void`                                   | Apply couponInput as coupon          |
| `clearCoupon`              | `() => void`                                   | Remove applied coupon                |
| `login`                    | `(event: FormEvent) => Promise<void>`          | Mock login authentication            |
| `register`                 | `(event: FormEvent) => Promise<void>`          | Mock user registration               |
| `checkout`                 | `() => Promise<void>`                          | Validate, create order, deduct stock |
| `onUpdateStock`            | `(product, nextStock) => void`                 | Admin: update product stock          |
| `onUpdateColorStock`       | `(productId, colorId, nextStock) => void`      | Admin: update color variant stock    |
| `onUpdateOrderStatus`      | `(orderId, nextStatus) => void`                | Admin: change order status           |
| `onUpdateOrder`            | `(orderId, patch) => void`                     | Admin: partial order update          |
| `onUpdateProduct`          | `(productId, patch) => void`                   | Admin: partial product update        |
| `onUpdateReview`           | `(reviewId, patch) => void`                    | Admin: moderate review               |
| `onDeleteReview`           | `(reviewId) => void`                           | Admin: delete review                 |
| `onUpdateSettings`         | `(patch) => void`                              | Admin: update store settings         |

---

## 5. API Route: Image Proxy

**Endpoint:** `/api/image?url=<encoded_url>`

**Purpose:** Proxies external images to avoid CORS issues.

**Usage:**
```typescript
const src = `/api/image?url=${encodeURIComponent("https://example.com/img.jpg")}`;