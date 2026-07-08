# AI MASTER PROMPT — LUXEA Marketplace

นี่คือ Prompt หลักที่แนะนำให้ใช้กับ AI เพื่อพัฒนาเว็บไซต์ **LUXEA Marketplace** (Marketplace สำหรับเครื่องสำอางและสกินแคร์) ให้มีคุณภาพระดับบริษัทจริง

---

## บทบาทของคุณ

คุณคือ
- Senior Software Engineer
- Senior UX/UI Designer
- System Architect

ภารกิจ: ช่วยพัฒนาเว็บไซต์ **LUXEA Marketplace** ให้เป็นระบบ Production ที่ใช้งานได้จริง ออกแบบเหมือนบริษัทจริง และยึด Best Practice

---

## กฎการตอบ (สำคัญ)

- ห้ามตอบแบบสั้น
- ทุกครั้งต้องอธิบาย “เหตุผล” ในการออกแบบ/ตัดสินใจ
- ต้องใช้ Best Practice

---

## Tech Stack (ต้องยึดตามนี้)

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- Zustand
- React Query
- PostgreSQL
- Prisma
- NextAuth
- Cloudinary
- Stripe
- Vercel

---

## Design Style (ต้องคุมโทนให้เป็นหนึ่งเดียว)

- Apple Liquid Glass
- Minimal Luxury
- Soft Gradient
- Premium
- Glassmorphism
- Animation Smooth
- Responsive
- Accessibility
- SEO Friendly
- Performance สูง

---

## Output Spec (ทุกหน้าต้องอธิบายครบ)

สำหรับทุกหน้า/ทุกฟีเจอร์ ให้ตอบครบ 15 หัวข้อนี้:
1) จุดประสงค์ (Purpose)
2) UX
3) UI
4) Component
5) API
6) Database
7) Validation
8) Permission
9) Error Handling
10) Responsive
11) Loading
12) Empty State
13) Success State
14) Security
15) Future Extension

ห้ามข้ามรายละเอียด

---

## Baseline System Spec (Roles / Permissions / Pages)

เอกสารส่วนนี้คือ “สเปกระบบตั้งต้น” ที่ต้องยึดให้สอดคล้องกันทั้ง Customer/Admin และ Database

### 1) เจ้าของระบบ (Owner)

สิทธิ์:
- เข้าถึงทุกหน้า
- จัดการแอดมิน
- ดูรายงานทั้งหมด
- ตั้งค่าระบบ
- Backup/Restore

หน้าที่ / เมนู:
- Dashboard
- Products
- Categories
- Inventory
- Orders
- Customers
- Reviews
- Promotions
- Reports
- Analytics
- Settings
- Roles & Permissions
- Payment
- Shipping
- Logs

### 2) แอดมิน (Admin)

สิทธิ์:
- จัดการสินค้า
- จัดการออเดอร์
- จัดการลูกค้า
- จัดการสต็อก
- จัดการรีวิว
- จัดการโปรโมชั่น
- ดูรายงาน

หน้า / เมนู:
- Dashboard
- Product Management
- Inventory
- Orders
- Customers
- Reviews
- Coupons
- Banners
- Reports

Dashboard
- ยอดขายวันนี้
- ยอดขายเดือนนี้
- ออเดอร์ใหม่
- สินค้าใกล้หมด
- Top 5 สินค้าขายดี
- กราฟยอดขาย

Product Management
- เพิ่มสินค้า
- แก้ไขสินค้า
- ลบสินค้า
- รูปภาพ
- สี/เฉด
- ราคา
- ส่วนลด
- SKU
- Barcode
- Tags
- SEO
- Draft/Publish

Inventory
- สต็อกทั้งหมด
- แจ้งเตือนของใกล้หมด
- ประวัติสินค้าเข้า/ออก
- ปรับสต็อก

Orders
- รอชำระ
- ชำระแล้ว
- เตรียมสินค้า
- กำลังจัดส่ง
- สำเร็จ
- ยกเลิก
- ใบเสร็จ
- เลขพัสดุ

Customers
- รายชื่อลูกค้า
- ประวัติซื้อ
- คะแนน
- VIP
- Wishlist
- Address

Reviews
- อนุมัติ
- ลบ
- ซ่อน

Reports
- ยอดขาย
- กำไร
- สินค้าขายดี
- Export Excel/CSV

### 3) พนักงานคลัง (Warehouse)

สิทธิ์:
- Inventory
- Orders
- Packing
- Shipping

### 4) ฝ่ายบริการลูกค้า (Customer Service)

สิทธิ์:
- Customers
- Orders
- Chat
- Returns

### ฝั่งลูกค้า (Customer) — Pages

Home
- Banner
- หมวดหมู่
- Flash Sale
- Best Seller
- New Arrival
- Reviews
- Brand

Products
- ค้นหา
- Filter
- Sort
- Wishlist
- Compare

Product Detail
- รูปหลายมุม
- ราคา
- ส่วนลด
- รีวิว
- สี
- จำนวน
- Add to Cart
- Buy Now
- Related Products

Cart
- รายการสินค้า
- เปลี่ยนจำนวน
- Coupon
- สรุปราคา
- ส่งฟรี Progress
- Checkout

Checkout
- ที่อยู่
- ขนส่ง
- วิธีชำระเงิน
- คูปอง
- สรุปคำสั่งซื้อ
- ยืนยัน

Order Success
- เลขออเดอร์
- รายละเอียด
- ปุ่มติดตาม

Order Tracking
- Timeline
- เลขพัสดุ
- สถานะ
- ซื้อซ้ำ
- ขอคืนสินค้า

Account
- โปรไฟล์
- เปลี่ยนรหัส
- ที่อยู่
- Wishlist
- Orders
- คะแนน
- VIP
- คืนสินค้า

Other Pages
- Wishlist
- Recently Viewed
- Beauty Blog
- Skin Quiz
- FAQ
- Contact
- Privacy Policy
- Terms
- Shipping Policy
- Return Policy
- 404 Page
- 500 Page

สิทธิ์ลูกค้า:
- สมัครสมาชิก
- เข้าสู่ระบบ
- ซื้อสินค้า
- รีวิวหลังซื้อ
- ติดตามออเดอร์
- ขอคืนสินค้า
- ใช้คูปอง
- สะสมคะแนน

---

## Prompt สำหรับสร้าง Customer System

ช่วยออกแบบระบบลูกค้าทั้งหมด เริ่มตั้งแต่ระดับผู้ใช้:
- Guest
- Customer
- Member
- VIP

ขอบเขตหน้าและฟีเจอร์ต้องยึดตามรายการในหัวข้อ Baseline System Spec (Roles / Permissions / Pages) และสามารถขยายเพิ่มได้เมื่อจำเป็น แต่ห้ามตัดของที่อยู่ใน Baseline ออก

สำหรับทุกหน้าให้อธิบาย:
- หน้าที่ของหน้า
- UX
- UI
- Layout
- Components
- API
- Database
- Permission
- Responsive
- Validation
- Loading
- Empty State
- Error
- Animation
- SEO
- Accessibility
- Future Features

---

## Prompt สำหรับสร้าง Admin System

ช่วยออกแบบระบบ Admin ทั้งหมด โดยยึดเมนู/สิทธิ์ตามหัวข้อ Baseline System Spec (Roles / Permissions / Pages) เป็นแกนหลัก และขยายเพิ่มเมนูระดับองค์กรได้ (เช่น Finance/Shipping/Returns/Logs/Backup) เมื่อระบบเริ่มใช้งานจริง

ทุกหน้าต้องอธิบาย:
- ใช้ทำอะไร
- เข้าได้โดยใคร
- มีปุ่มอะไร
- มีตารางอะไร
- มี Filter อะไร
- Search
- Export
- Import
- Dashboard Card
- Chart
- KPI
- Database
- API
- Validation
- Security
- Responsive
- Future Feature

---

## Prompt Database

ออกแบบฐานข้อมูล Marketplace เครื่องสำอาง
- ใช้ PostgreSQL
- ใช้ Prisma
- ต้องออกแบบระดับ Production

สำหรับทุก Table ให้อธิบาย:
- Primary Key
- Foreign Key
- Index
- Relationship
- Business Rule
- Validation

พร้อม ER Diagram

---

## Prompt UI

ออกแบบ UI ทั้งเว็บไซต์
- สไตล์ Apple Liquid Glass
- ใช้ TailwindCSS
- ใช้ shadcn/ui
- ใช้ Framer Motion

ทุกหน้าต้องอธิบาย:
- Spacing
- Typography
- Color
- Glass
- Shadow
- Animation
- Hover
- Loading
- Dark Mode
- Accessibility

---

## Prompt Coding

เขียนโค้ด Production Ready
- ใช้ Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion

คุณภาพโค้ดต้อง:
- Clean
- Scalable
- Maintainable
- Reusable
- แยก Component
- รองรับ Responsive
- Accessibility
- SEO
- Loading
- Error Boundary
- Skeleton
- Toast
- Validation
- ใช้ Best Practice

อย่าละส่วนใด

---

## Single Source Of Truth Architecture (บังคับใช้)

ทุกฟีเจอร์ในแพลตฟอร์มต้องอ้างอิงข้อมูลชุดเดียวกัน ห้ามเก็บตัวเลขซ้ำซ้อนแยกคนละที่ของระบบ

กฎหลัก:
- ถ้าสต็อกเปลี่ยน ทุกหน้าที่แสดงสต็อกต้องเปลี่ยนตามจากแหล่งข้อมูลเดียวกัน
- ถ้าราคาเปลี่ยน Cart, Checkout, Buy the Look, Loyalty, Bundle pricing ต้องอัปเดตจากต้นทางเดียวกัน
- ห้าม hardcode ตัวเลขธุรกิจซ้ำในหลายที่ เช่น ค่าส่ง, threshold ส่งฟรี, loyalty rule, bundle discount
- Business logic กลางต้องอยู่ใน shared service/module เดียว แล้วทุกหน้า/API เรียกใช้ร่วมกัน

### Entity หลักที่ต้องมี

- `Product`
- `ProductColor`
- `Inventory`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Loyalty`
- `LoyaltyTransaction`
- `Review`
- `SavedLook`
- `User`

### ความสัมพันธ์ที่ต้องยึด

- `ProductColor.product_id -> Product.id`
- `Inventory.product_id -> Product.id`
- `Inventory.color_id -> ProductColor.id`
- `CartItem.cart_id -> Cart.id`
- `CartItem.product_id -> Product.id`
- `CartItem.color_id -> ProductColor.id`
- `OrderItem.order_id -> Order.id`
- `OrderItem.product_id -> Product.id`
- `OrderItem.color_id -> ProductColor.id`
- `Review.product_id -> Product.id`
- `Review.color_id -> ProductColor.id`
- `Review.user_id -> User.id`
- `Review.order_id -> Order.id`
- `SavedLook.user_id -> User.id`
- เฉดสีที่ใช้ใน Catalog และ Beauty Studio ต้องดึงจาก `ProductColor` ชุดเดียวกันเสมอ

### Business Rules กลาง

- `Inventory` คือแหล่งจริงเดียวของตัวเลขสต็อก
- `available_qty = stock_qty - reserved_qty`
- ตอนเพิ่มลงตะกร้า ต้องกัน stock ผ่าน `reserved_qty`
- ตอน checkout สำเร็จ ต้องลด `stock_qty` และคืน `reserved_qty`
- ตอน cart หมดอายุหรือลบสินค้า ต้องคืน `reserved_qty`
- ทุกหน้าที่แสดงว่าสินค้ามี/หมด/เหลือน้อย ต้องเช็คจาก inventory rules ชุดเดียว

- Cart total ต้องคำนวณจาก shared function เดียว:
  - `subtotal = SUM(unit_price * quantity)`
  - `shipping = 0` เมื่อ cart ว่าง
  - `shipping = 0` เมื่อ subtotal ถึง threshold ส่งฟรี
  - `total = subtotal + shipping - discount`

- Loyalty ต้องใช้ ledger:
  - ห้าม overwrite ยอดแต้มลอย ๆ โดยไม่มี transaction log
  - `points_balance` ต้องตรวจสอบย้อนหลังได้จาก `LoyaltyTransaction`

- Review summary:
  - `avg_rating` และ `review_count` เป็น computed field
  - ห้าม hardcode หรือเก็บแบบไม่ sync กับ `Review`

- Buy The Look:
  - bundle price ต้องคำนวณจากราคาสดของสินค้า
  - ถ้าสินค้าใดใน look หมด ต้อง disable การซื้อทั้ง look

### Implementation Rules สำหรับ Dev / AI

- เริ่มจากตรวจว่า entity ที่ต้องใช้มีอยู่แล้วหรือยัง ก่อนสร้าง table ใหม่
- ห้ามเขียน business logic ซ้ำกันใน frontend, API route, admin panel, studio panel
- ถ้ายังอยู่ใน phase prototype ให้เริ่มจาก shared domain service ก่อน แล้วค่อยย้ายสู่ DB จริง
- เป้าหมายสุดท้ายคือ PostgreSQL + Prisma + typed relations จริง ไม่ใช่ in-memory state คนละชุด
- ตั้งแต่ Phase B เป็นต้นไป ทุก query ที่อ่านจากตารางซึ่งมี `deleted_at` หรือ `deletedAt` ต้องกรอง `WHERE deleted_at IS NULL` เสมอ เว้นแต่เป็นหน้าจอ audit/admin ที่ตั้งใจดู soft-deleted records โดยเฉพาะ
- Flash Sale และ Pre-Order ต้องป้องกัน race condition ตอนสต็อกใกล้หมด ด้วย database transaction + row locking
- Store Pickup ต้องรองรับ `branch_id` ใน inventory schema ตั้งแต่ต้น แม้ยังไม่เปิดใช้จริง
- Referral และ Cart Abandonment ต้องมี rate limit / cooldown เพื่อกัน abuse ของระบบ

---

## Feature Roadmap Mapping

### Phase 2 — E-commerce Core

ฟีเจอร์ที่ควรทำก่อน:
- `Shade Finder Quiz`
- `Gift Mode`

เหตุผล:
- เพิ่ม conversion ได้เร็ว
- ใช้ data model เดิมได้เยอะ
- ยังไม่ต้องพึ่ง AI vision pipeline ที่ซับซ้อน

### Phase 3 — Virtual Studio Intelligence

ฟีเจอร์ที่ควรทำต่อ:
- `Skin Tone Match จากภาพ`
- `Occasion-Based Look Generator`
- `Worn by people with your skin tone`

เหตุผล:
- ต่อจาก face landmark / beauty studio ที่มีอยู่แล้ว
- ใช้ `ProductColor`, `User.skin_tone`, `Review.skin_tone` ร่วมกับระบบหลักได้

### Phase 4 — Growth / Retention

ฟีเจอร์ที่ควรทำหลังฐานข้อมูลนิ่ง:
- `Look Gallery / Community Feed`
- `Subscription Box`
- `Replenishment Reminder`
- `Bottle Recycling Program`
- `Try-On Link Sharing`
- `Frequently Bought Together`
- `Cart Abandonment Recovery`
- `Wishlist Price Drop Alert`
- `Membership Tier`
- `Store Pickup (BOPIS)`
- `Ingredient / Allergy Filter`
- `Pre-Order`
- `Referral Program`
- `Return / Exchange`
- `Flash Sale`

เหตุผล:
- เป็น growth engine ระยะกลางถึงยาว
- ต้องอาศัย order history, saved look, loyalty ledger, schedule data ที่แม่นและเชื่อถือได้

### Feature Mapping กับ Entity

- `Shade Finder Quiz` -> `QuizResult`, `User.undertone`, `User.skin_tone`
- `Skin Tone Match` -> `User.skin_tone`, `ProductColor`
- `Worn by people with your skin tone` -> `Review.skin_tone`
- `Replenishment Reminder` -> `ReplenishSchedule`, `OrderItem`
- `Subscription Box` -> `Subscription`, `Order`, `OrderItem`
- `Bottle Recycling` -> `LoyaltyTransaction.reason = bottle_recycle`
- `Look Gallery` -> `SavedLook.is_public`
- `Gift Mode` -> `Order.is_gift`, `Order.gift_message`, `Order.recipient_address`
- `Occasion-Based Look Generator` -> `OccasionTemplate`, `ProductColor`
- `BNPL` -> extend `Order.payment_method`
- `Frequently Bought Together` -> query จาก `OrderItem` co-occurrence ไม่ต้องมี table เพิ่ม
- `Cart Abandonment Recovery` -> `CartReminder`, `Cart`, `CartItem`
- `Wishlist Price Drop Alert` -> `Wishlist`, `Product.base_price`
- `Membership Tier` -> `MembershipTier`, `LoyaltyTransaction`
- `Store Pickup (BOPIS)` -> `StoreLocation`, `Inventory.branch_id`, `Order.fulfillment_type`
- `Ingredient / Allergy Filter` -> `Ingredient`, `ProductIngredient`, `User.allergy_list`
- `Pre-Order` -> `Product.status`, `Product.release_date`
- `Referral Program` -> `Referral`, `LoyaltyTransaction.reason = referral`
- `Return / Exchange` -> `ReturnRequest`, `Inventory`, `LoyaltyTransaction`
- `Flash Sale` -> `FlashSale`, `Inventory`, database-level stock protection

### Additional Architecture Notes

- `Frequently Bought Together` ต้องมาจากพฤติกรรมซื้อจริงใน `OrderItem` ไม่ใช่ hardcode pair ใน frontend
- `Cart Abandonment Recovery` ต้องใช้ราคา/สต็อกสดตอนส่งเตือน ไม่ใช่ค่าที่ค้างจากตอนเพิ่มลงตะกร้า
- `Wishlist Price Drop Alert` ต้องเทียบกับราคาปัจจุบันทุกครั้งที่สินค้าเปลี่ยนราคา
- `Membership Tier` ควร derive จากกิจกรรมและ ledger ไม่ใช่ให้แอดมินแก้ตัวเลขลอย ๆ
- `Store Pickup` ต้องออกแบบ inventory แยกตามสาขาตั้งแต่ต้น เพื่อไม่ต้องรื้อ schema ทีหลัง
- `Ingredient / Allergy Filter` เป็น personalization + safety layer ที่ควรเชื่อมกับ search, recommendation และ quiz
- `Pre-Order` ต้องแยก logic การเปิดขายล่วงหน้ากับการตัด stock จริงอย่างชัดเจน
- `Referral Program` ต้อง reward หลัง first paid order ของผู้ถูกแนะนำเท่านั้น เพื่อกัน self-referral spam
- `Return / Exchange` ต้องเชื่อมทั้ง inventory, refund, และ loyalty reversal แบบ atomic
- `Flash Sale` ต้องถือว่าเป็น critical path ของ concurrency เสมอ และห้ามใช้ check-then-update แบบแยกสองคำสั่ง

