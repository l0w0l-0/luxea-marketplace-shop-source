/*
==================================================

ไฟล์: index.ts

ตำแหน่ง: src/constants/

หน้าที่:
รวมค่าคงที่ทั้งหมดของระบบ LUXEA Beauty Shop
เป็นแหล่งรวมค่ากำหนดที่ใช้ร่วมกันทั่วทั้งแอปพลิเคชัน

รับผิดชอบ:
- กำหนดค่ากำหนดของร้านค้า (Commerce Config)
- กำหนดค่า UI Constants
- กำหนดค่าเริ่มต้นสำหรับการตั้งค่า
- กำหนด Admin Tabs

ใช้งานร่วมกับ:
- Services
- Components
- Utils

Export:
- COMMERCE_CONFIG, CATEGORY_ICONS, PAYMENT_METHODS
- DEFAULT_STORE_SETTINGS, DEMO_ADMIN_EMAIL
- MESSAGE_DURATION, LOADING_DURATION
- ADMIN_TABS, AdminTabId

หมายเหตุ:
ค่าคงที่เหล่านี้ไม่ควรเปลี่ยนแปลงระหว่าง runtime
ใช้ as const เพื่อป้องกันการแก้ไขโดยไม่ตั้งใจ

==================================================
*/

// ======================================================
// Imports
// นำเข้า Library และ Module ที่จำเป็น
// ======================================================

// ======================================================
// ค่ากำหนดร้านค้า (Commerce Config)
// ใช้สำหรับคำนวณราคา ค่าจัดส่ง และแต้มสะสม
// ======================================================

/**
 * จุดประสงค์:
 * กำหนดค่ากำหนดหลักของร้านค้า
 *
 * การทำงาน:
 * ใช้เป็นค่าเริ่มต้นสำหรับการคำนวณราคา
 * ค่าจัดส่ง และระบบแต้มสะสม
 *
 * Parameter:
 * freeShippingThreshold - ยอดสั่งซื้อขั้นต่ำที่ได้รับสิทธิ์ส่งฟรี (บาท)
 * shippingFee - ค่าจัดส่งเริ่มต้น (บาท)
 * loyaltyPointUnitBaht - ทุกกี่บาทได้ 1 แต้ม
 * lowStockThreshold - จำนวนสต็อกที่ถือว่าใกล้หมด
 *
 * หมายเหตุ:
 * ใช้ as const เพื่อให้ TypeScript infer ค่า literal
 */
export const COMMERCE_CONFIG = {
  freeShippingThreshold: 699,
  shippingFee: 50,
  loyaltyPointUnitBaht: 100,
  lowStockThreshold: 10,
} as const;

// ======================================================
// หมวดหมู่สินค้า (Categories)
// แผนที่ไอคอนสำหรับแต่ละหมวดหมู่
// ======================================================

/**
 * จุดประสงค์:
 * กำหนดไอคอน Emoji สำหรับแต่ละหมวดหมู่สินค้า
 *
 * การทำงาน:
 * ใช้ใน CategoryRail และ CategoryChips
 * เพื่อแสดงไอคอนที่สอดคล้องกับหมวดหมู่
 *
 * หมายเหตุ:
 * หากเพิ่มหมวดหมู่ใหม่ ต้องเพิ่มไอคอนที่นี่ด้วย
 */
export const CATEGORY_ICONS: Record<string, string> = {
  ทั้งหมด: "\uD83D\uDECD\uFE0F",
  Lipstick: "\uD83D\uDC84",
  Blush: "\uD83C\uDF38",
  Highlighter: "\u2728",
  Foundation: "\uD83E\uDDF4",
  Skincare: "\uD83E\uDDF6\u200D\u2640\uFE0F",
  Eyeshadow: "\uD83C\uDFA8",
  Eye: "\uD83D\uDC41\uFE0F",
  Setting: "\uD83D\uDCA8",
  Face: "\uD83E\uDDF4",
  Tools: "\uD83D\uDD8C\uFE0F",
};

// ======================================================
// วิธีการชำระเงิน (Payment Methods)
// รายการช่องทางชำระเงินที่รองรับ
// ======================================================

/**
 * จุดประสงค์:
 * รายการวิธีการชำระเงินทั้งหมดที่ระบบรองรับ
 *
 * การทำงาน:
 * ใช้ใน CheckoutPanel และ Admin Settings
 * เพื่อแสดงตัวเลือกชำระเงิน
 */
export const PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "Cash On Delivery",
] as const;

// ======================================================
// ค่าเริ่มต้น (Defaults)
// ค่าเริ่มต้นสำหรับการตั้งค่าร้านค้า
// ======================================================

/**
 * จุดประสงค์:
 * ค่าเริ่มต้นสำหรับ StoreSettings
 *
 * การทำงาน:
 * ใช้ตอนเริ่มต้นแอปเพื่อกำหนดค่าเริ่มต้น
 * ก่อนที่แอดมินจะปรับแต่ง
 */
export const DEFAULT_STORE_SETTINGS = {
  freeShippingThreshold: COMMERCE_CONFIG.freeShippingThreshold,
  shippingFee: COMMERCE_CONFIG.shippingFee,
  lowStockThreshold: COMMERCE_CONFIG.lowStockThreshold,
  enabledPaymentMethods: ["Credit Card", "Bank Transfer", "Cash On Delivery"] as Array<
    "Credit Card" | "Bank Transfer" | "Cash On Delivery"
  >,
};

/**
 * จุดประสงค์:
 * อีเมลแอดมินสำหรับโหมด Demo
 *
 * การทำงาน:
 * ถ้าเปิดใช้งาน NEXT_PUBLIC_ENABLE_DEMO_ADMIN
 * การล็อกอินด้วย admin@luxea.test จะได้สิทธิ์แอดมิน
 *
 * หมายเหตุ:
 * ใช้ Environment Variable เพื่อความปลอดภัย
 */
export const DEMO_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_ADMIN === "true"
    ? "admin@luxea.test"
    : null;

// ======================================================
// UI Constants
// ค่าคงที่สำหรับการแสดงผล
// ======================================================

/**
 * จุดประสงค์:
 * ระยะเวลาแสดงข้อความแจ้งเตือน (มิลลิวินาที)
 *
 * การทำงาน:
 * ข้อความแจ้งเตือนจะหายไปอัตโนมัติหลังจากเวลานี้
 */
export const MESSAGE_DURATION = 2600;

/**
 * จุดประสงค์:
 * ระยะเวลาแสดง Loading Screen (มิลลิวินาที)
 *
 * การทำงาน:
 * แสดงหน้าจอโหลดระหว่างเตรียมข้อมูลเริ่มต้น
 */
export const LOADING_DURATION = 2500;

// ======================================================
// Admin Tabs
// แท็บการทำงานในหน้า Admin Panel
// ======================================================

/**
 * จุดประสงค์:
 * กำหนดแท็บทั้งหมดในหน้า Admin Panel
 *
 * การทำงาน:
 * แต่ละแท็บมี id, label, eyebrow, icon
 * ใช้ใน AdminPanel เพื่อสร้าง Sidebar Navigation
 *
 * หมายเหตุ:
 * id ใช้เป็น Type Literal Union
 */
export const ADMIN_TABS = [
  { id: "dashboard" as const, label: "Control Center", eyebrow: "Overview", icon: "\u25C8" },
  { id: "products" as const, label: "Products", eyebrow: "Catalog", icon: "\u2726" },
  { id: "inventory" as const, label: "Inventory", eyebrow: "Stock", icon: "\u25CC" },
  { id: "orders" as const, label: "Orders", eyebrow: "Fulfillment", icon: "\u2192" },
  { id: "customers" as const, label: "Customers", eyebrow: "CRM", icon: "\u25CE" },
  { id: "reviews" as const, label: "Reviews", eyebrow: "Content", icon: "\u2733" },
  { id: "reports" as const, label: "Reports", eyebrow: "Revenue", icon: "\u25EB" },
  { id: "settings" as const, label: "Settings", eyebrow: "System", icon: "\u22EF" },
] as const;

/**
 * จุดประสงค์:
 * Type สำหรับ id ของ Admin Tab
 *
 * การทำงาน:
 * ใช้ใน AdminPanel เพื่อ type-safe การเปลี่ยนแท็บ
 */
export type AdminTabId = (typeof ADMIN_TABS)[number]["id"];