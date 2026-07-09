# LUXEA Beauty Studio — Admin Guide

## 1. Accessing the Admin Panel

1. Go to the **Account** page (click profile icon in top bar)
2. Click **"ไปหน้า Admin"** button
3. If not logged in as admin, log in with:
   - **Email:** `admin@luxea.test`
   - **Password:** any value
   - (Requires `NEXT_PUBLIC_ENABLE_DEMO_ADMIN=true` environment variable)

> **Note:** Only users with `role: "admin"` can access the admin panel. Non-admin users are redirected to the home page.

## 2. Admin Panel Overview

The admin panel has 8 tabs accessed via the sidebar:

| Tab         | Icon | Purpose |
|-------------|------|---------|
| Control Center | ◈ | Overview dashboard |
| Products    | ✦ | Manage product catalog |
| Inventory   | ◌ | Track and update stock |
| Orders      | → | Manage customer orders |
| Customers   | ◎ | View customer data |
| Reviews     | ✳ | Moderate product reviews |
| Reports     | ◫ | Export data and generate reports |
| Settings    | ⋯ | Configure store settings |

The sidebar header shows:
- **Revenue:** Total value of paid orders
- **Queue:** Number of orders requiring action (waiting_payment, paid, processing, cod)

## 3. Dashboard Tab ("Control Center")

Shows four summary statistics:
- **จำนวนสินค้าทั้งหมด** — Total products in catalog
- **ออเดอร์** — Total orders (all statuses)
- **Cart Value** — Current value of items in cart
- **จำนวนสินค้าใกล้หมด** — Products with stock ≤ low stock threshold

## 4. Products Tab

**Features:**
- Search products by name, category, or shade
- View all products in a list

**Coming Soon:** Edit product name, price, status (draft/published), and tags.

## 5. Inventory Tab

**Features:**
- Search inventory by product name/category/shade
- Filter: **"แสดงเฉพาะใกล้หมด"** checkbox — shows only products with low stock
- Each product shows:
  - Product name
  - Category and price
  - Current stock quantity (editable input)
  - **Save** button to update stock

**Managing Stock Per Color Variant:**
- The system automatically distributes stock across color variants proportionally when the total stock is updated
- To update a specific color's stock, use the `onUpdateColorStock` function (available through the UI)

**Stock Audit Trail:**
Every stock change is recorded in the **Stock Movements** log with:
- Product name, color (if applicable)
- Delta (positive = added, negative = removed)
- Reason: `manual_adjust` or `order_checkout`
- Who made the change

## 6. Orders Tab

**Features:**
- **Filter by status:** All / รอชำระ / ชำระแล้ว / ปลายทาง / กำลังเตรียมของ / จัดส่งแล้ว / สำเร็จ / ยกเลิก
- **Search:** Search by order ID, customer name, payment method, tracking number, or phone
- **Export CSV:** Download filtered orders as CSV file
- **Click order card** to view order details

**Order Statuses:**
| Status           | Thai Label      | Description                  |
|------------------|-----------------|------------------------------|
| waiting_payment  | รอชำระ          | Awaiting bank transfer       |
| paid             | ชำระแล้ว        | Payment confirmed            |
| cod              | ปลายทาง         | Cash on delivery             |
| processing       | กำลังเตรียมของ   | Being prepared               |
| shipped          | จัดส่งแล้ว       | Shipped to customer          |
| completed        | สำเร็จ          | Delivered successfully       |
| cancelled        | ยกเลิก          | Order cancelled              |

## 7. Customers Tab

Shows a list of all customers who have placed orders, sorted by total spend (highest first). Each customer row shows:
- **Name**
- **Total spent** (formatted in THB)

Data is derived from the orders list (cancelled orders excluded).

## 8. Reviews Tab

**Features:**
- View all product reviews
- Search reviews by username or comment text
- Filter by review status (all / approved / pending)

**Coming Soon:** Approve, hide, or delete reviews from this tab.

## 9. Reports Tab

**Features:**
- **Export Orders CSV:** Download all orders as a CSV file with columns:
  - order_id, created_at, customer_name, status, payment_method
  - shipping_name, shipping_phone, shipping_address, tracking_number
  - subtotal, discount, shipping_fee, total, coupon_code, items

**Data Views (calculated but not yet displayed in UI):**
- **Sales by Day:** Daily sales totals from completed orders
- **Top Products:** Top 5 products by revenue
- **Sales by Category:** Revenue broken down by product category

## 10. Settings Tab

Configure store-wide settings:

| Setting                    | Default | Description                    |
|----------------------------|---------|--------------------------------|
| Free Shipping Threshold    | 699 ฿   | Minimum order for free shipping |
| Shipping Fee               | 50 ฿    | Default shipping cost          |
| Low Stock Threshold        | 10      | Stock count for low-stock alert |
| Payment Methods            | All 3   | Enabled payment methods        |

Changes save immediately (in-memory). In production, this would persist to the database.

## 11. CSV Export Format

The Orders CSV export uses the following format:

```csv
"order_id","created_at","customer_name","status","payment_method","shipping_name","shipping_phone","shipping_address","tracking_number","subtotal","discount","shipping_fee","total","coupon_code","items"
"ORD-123","7/9/2026","Customer Name","paid","Credit Card","Recipient","0812345678","Address","TRACK123","299","0","50","349","LUXEA10","Product Name x1 (299)"
```

## 12. Printing Documents

The admin panel supports printing:
- **ใบเสร็จรับเงิน (Receipt):** Opens a new window with order items and total
- **ใบจัดส่ง (Shipping Label):** Opens a new window formatted for shipping

Both trigger the browser's print dialog automatically.

## 13. Common Admin Tasks

### Update Product Stock
1. Go to **Inventory** tab
2. Search for the product
3. Enter new stock quantity in the input field
4. Click **Save**

### Change Order Status
1. Go to **Orders** tab
2. Click on the order to select it
3. Use the status filter to find orders by status
4. (Status update UI is available via `onUpdateOrderStatus` callback)

### Export Orders
1. Go to **Orders** or **Reports** tab
2. Click **Export CSV** button
3. File downloads as `luxea-orders-YYYY-MM-DD.csv`

### View Low Stock Items
1. Go to **Inventory** tab
2. Check **"แสดงเฉพาะใกล้หมด"** checkbox
3. Only products with stock ≤ threshold will be shown