/*
==================================================

ไฟล์: index.ts

ตำแหน่ง: src/types/

หน้าที่:
รวมศูนย์ Type definitions ทั้งหมดของระบบ LUXEA Beauty Shop
เป็น Source of Truth สำหรับโครงสร้างข้อมูลทั่วทั้งแอปพลิเคชัน

รับผิดชอบ:
- กำหนด Interface และ Type สำหรับข้อมูลทุกประเภท
- เป็นแหล่งอ้างอิงกลางที่ Component และ Service ต่าง ๆ ใช้ร่วมกัน
- ป้องกันข้อผิดพลาดจากการใช้ข้อมูลผิดรูปแบบ

ใช้งานร่วมกับ:
- ทุก Component ในระบบ
- API Routes ฝั่ง Backend
- State Management

Export:
- ProductColor, Product, User, CartItem, Order, OrderStatus
- Review, Coupon, StoreSettings, StockMovement, AppView
- PaymentMethod, PaymentMethodArray

หมายเหตุ:
- ใช้ Interface สำหรับ Object ที่มี Methods
- ใช้ Type สำหรับ Union / Intersection Types
- Type ทั้งหมดควรเป็น Readonly เมื่อไม่จำเป็นต้องแก้ไข

==================================================
*/

// ======================================================
// สินค้า (Product Module)
// ระบบจัดการข้อมูลสินค้าเครื่องสำอางทุกรายการ
// ======================================================

/**
 * จุดประสงค์:
 * กำหนดสีแต่ละเฉดของสินค้าเครื่องสำอาง
 * เช่น สี Rosy Pink หรือ Coral Red
 *
 * การทำงาน:
 * ใช้เพื่อแยกสต็อกและข้อมูลตามเฉดสีของสินค้าแต่ละรายการ
 *
 * Parameter:
 * id - รหัสเฉดสี (ไม่มีช่องว่าง)
 * name - ชื่อสีที่แสดง
 * hex - รหัสสี Hex
 * undertone - โทนสีใต้ผิว (Cool/Warm/Neutral) (ไม่บังคับ)
 * finish - เนื้อผลิตภัณฑ์ (Matte/Satin/Shimmer) (ไม่บังคับ)
 * coverage - ระดับการปกปิด (ไม่บังคับ)
 * stock - จำนวนคงเหลือเฉพาะเฉดสีนี้
 *
 * Return:
 * ProductColor Object
 *
 * หมายเหตุ:
 * stock ต้องมีค่ามากกว่าหรือเท่ากับ 0 เสมอ
 */
export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  undertone?: string;
  finish?: string;
  coverage?: string;
  stock: number;
}

/**
 * จุดประสงค์:
 * แทนข้อมูลสินค้าทุกรายการในระบบ
 *
 * การทำงาน:
 * ใช้เป็นโครงสร้างกลางสำหรับ Product Service
 * และ Component ต่าง ๆ ที่แสดงข้อมูลสินค้า
 *
 * Parameter:
 * id - รหัสสินค้า (ไม่ซ้ำกัน)
 * name - ชื่อสินค้าที่แสดง
 * category - หมวดหมู่สินค้า
 * shade - เฉดสีเริ่มต้น
 * price - ราคาสินค้า (บาท)
 * stock - สต็อกรวมทุกรุ่นสี
 * rating - คะแนนรีวิวเฉลี่ย
 * reviewCount - จำนวนรีวิว
 * color - รหัสสีหลักสำหรับตกแต่ง UI
 * description - คำอธิบายสินค้า
 * image - URL รูปภาพสินค้า
 * colors - รายการเฉดสี
 * isPremium - สินค้าพรีเมียม (ไม่บังคับ)
 * status - สถานะการขาย (draft/published) (ไม่บังคับ)
 * tags - แท็กสำหรับจัดหมวดหมู่ (ไม่บังคับ)
 * sortOrder - ลำดับการแสดงผล (ไม่บังคับ)
 *
 * Return:
 * Product Object
 *
 * หมายเหตุ:
 * stock ต้องตรงกับผลรวมของ colors.stuck เสมอ
 */
export interface Product {
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

// ======================================================
// ผู้ใช้ (User Module)
// จัดการข้อมูลผู้ใช้ทั้งลูกค้าและแอดมิน
// ======================================================

/**
 * จุดประสงค์:
 * แทนข้อมูลผู้ใช้งานระบบ
 *
 * การทำงาน:
 * ใช้สำหรับ Authentication และ Authorization
 * แยกบทบาทระหว่างลูกค้าและแอดมิน
 *
 * Parameter:
 * id - รหัสผู้ใช้
 * name - ชื่อผู้ใช้
 * email - อีเมล
 * role - บทบาท (customer/admin)
 * tier - ระดับสมาชิก (Member/VIP)
 * points - คะแนนสะสม
 *
 * Return:
 * User Object
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  tier: "Member" | "VIP";
  points: number;
}

// ======================================================
// ตะกร้าสินค้า (Cart Module)
// จัดการรายการสินค้าที่ผู้ใช้เลือกซื้อ
// ======================================================

/**
 * จุดประสงค์:
 * เก็บรายการสินค้าที่ผู้ใช้เลือกใส่ตะกร้า
 *
 * การทำงาน:
 * ใช้เพื่อคำนวณราคารวมและส่งต่อไปยัง Checkout
 *
 * Parameter:
 * productId - รหัสสินค้า
 * colorId - รหัสเฉดสีที่เลือก
 * quantity - จำนวนสินค้า
 *
 * Return:
 * CartItem Object
 */
export interface CartItem {
  productId: string;
  colorId: string;
  quantity: number;
}

// ======================================================
// คำสั่งซื้อ (Order Module)
// จัดการข้อมูล Order และสถานะ
// ======================================================

/**
 * จุดประสงค์:
 * กำหนดสถานะที่เป็นไปได้ทั้งหมดของออเดอร์
 *
 * การทำงาน:
 * ใช้เพื่อเปลี่ยนสถานะออเดอร์ตามลำดับ
 * waiting_payment → paid → processing → shipped → completed
 *
 * หมายเหตุ:
 * cancelled สามารถเกิดขึ้นได้ทุกสถานะ
 * cod ไม่ต้องผ่าน waiting_payment
 */
export type OrderStatus =
  | "paid"
  | "waiting_payment"
  | "cod"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

/**
 * จุดประสงค์:
 * จัดเก็บข้อมูลคำสั่งซื้อที่สมบูรณ์
 *
 * การทำงาน:
 * ใช้เพื่อแสดงประวัติการซื้อ
 * และใช้ใน Admin Panel จัดการออเดอร์
 *
 * Parameter:
 * id - รหัสออเดอร์ (ORD-xxxxxxxxx)
 * customerName - ชื่อลูกค้า
 * items - รายการสินค้าในออเดอร์
 * shippingName - ชื่อผู้รับ
 * shippingPhone - เบอร์โทรผู้รับ
 * shippingAddress - ที่อยู่จัดส่ง
 * shippingMethod - วิธีการจัดส่ง
 * trackingNumber - เลขพัสดุ (ไม่บังคับ)
 * trackingUrl - ลิงก์ติดตาม (ไม่บังคับ)
 * subtotal - ยอดก่อนหักส่วนลด
 * discount - ส่วนลด
 * shippingFee - ค่าจัดส่ง
 * total - ยอดรวมสุทธิ
 * couponCode - โค้ดส่วนลด (ไม่บังคับ)
 * paymentMethod - ช่องทางชำระเงิน
 * status - สถานะออเดอร์
 * createdAt - วันที่สร้างออเดอร์
 *
 * Return:
 * Order Object
 */
export interface Order {
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

// ======================================================
// รีวิว (Review Module)
// จัดการรีวิวสินค้าจากผู้ใช้
// ======================================================

/**
 * จุดประสงค์:
 * เก็บรีวิวที่ผู้ใช้เขียนถึงสินค้า
 *
 * การทำงาน:
 * ใช้เพื่อแสดงความคิดเห็นในหน้าสินค้า
 * และให้แอดมินจัดการสถานะรีวิว
 *
 * Parameter:
 * id - รหัสรีวิว
 * userId - รหัสผู้เขียนรีวิว
 * userName - ชื่อผู้เขียน
 * productId - รหัสสินค้า
 * rating - คะแนน 1-5
 * comment - ข้อความรีวิว
 * skinTone - โทนผิว (ไม่บังคับ)
 * createdAt - วันที่เขียน
 * status - สถานะ (approved/pending/hidden) (ไม่บังคับ)
 *
 * Return:
 * Review Object
 */
export interface Review {
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

// ======================================================
// คูปองส่วนลด (Coupon Module)
// จัดการโค้ดส่วนลดที่ใช้ได้ในระบบ
// ======================================================

/**
 * จุดประสงค์:
 * กำหนดรูปแบบคูปองส่วนลดที่ระบบรองรับ
 *
 * การทำงาน:
 * LUXEA10 - ลด 10% สูงสุด 200 บาท
 * FREESHIP - ยกเว้นค่าจัดส่ง
 *
 * หมายเหตุ:
 * ปัจจุบันรองรับเพียง 2 ชนิดนี้เท่านั้น
 * หากเพิ่มชนิดใหม่ต้องอัปเดต calculateCartSummary ด้วย
 */
export type Coupon =
  | { code: "LUXEA10"; kind: "percent10" }
  | { code: "FREESHIP"; kind: "freeship" };

// ======================================================
// การตั้งค่าร้านค้า (Settings Module)
// จัดการค่ากำหนดของร้านค้า
// ======================================================

/**
 * จุดประสงค์:
 * เก็บค่ากำหนดต่าง ๆ ของร้านค้า
 *
 * การทำงาน:
 * ใช้ในการคำนวณค่าจัดส่ง
 * และแสดงผลในหน้า Admin Settings
 *
 * Parameter:
 * freeShippingThreshold - ยอดขั้นต่ำส่งฟรี
 * shippingFee - ค่าส่งเริ่มต้น
 * lowStockThreshold - เกณฑ์แจ้งเตือนสต็อกต่ำ
 * enabledPaymentMethods - ช่องทางชำระเงินที่เปิด
 *
 * Return:
 * StoreSettings Object
 */
export interface StoreSettings {
  freeShippingThreshold: number;
  shippingFee: number;
  lowStockThreshold: number;
  enabledPaymentMethods: Array<
    "Credit Card" | "Bank Transfer" | "Cash On Delivery"
  >;
}

// ======================================================
// คลังสินค้า (Stock Movement Module)
// บันทึกประวัติการเปลี่ยนแปลงสต็อก
// ======================================================

/**
 * จุดประสงค์:
 * บันทึกประวัติการเคลื่อนไหวของสต็อกสินค้า
 *
 * การทำงาน:
 * ใช้เป็น Audit Log สำหรับตรวจสอบการเปลี่ยนแปลงสต็อก
 * ช่วยในการตรวจสอบย้อนหลัง
 *
 * Parameter:
 * id - รหัสรายการ
 * createdAt - วันที่-เวลา
 * productId - รหัสสินค้า
 * productName - ชื่อสินค้า
 * colorId - รหัสเฉดสี (ไม่บังคับ)
 * colorName - ชื่อเฉดสี (ไม่บังคับ)
 * delta - จำนวนที่เปลี่ยนแปลง (+/-)
 * reason - สาเหตุ (manual_adjust/order_checkout)
 * actor - ผู้ทำรายการ
 * note - หมายเหตุ (ไม่บังคับ)
 *
 * Return:
 * StockMovement Object
 */
export interface StockMovement {
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

// ======================================================
// Views (Navigation Module)
// กำหนดหน้าต่าง ๆ ในแอปพลิเคชัน
// ======================================================

/**
 * จุดประสงค์:
 * กำหนดหน้าหลักทั้งหมดที่ผู้ใช้สามารถเข้าถึงได้
 *
 * การทำงาน:
 * ใช้ควบคุมการนำทางระหว่างหน้า
 * state view จะเปลี่ยนไปตามที่ผู้ใช้เลือก
 */
export type AppView =
  | "home"
  | "studio"
  | "shop"
  | "wishlist"
  | "account"
  | "admin"
  | "checkout"
  | "product-detail";

/**
 * จุดประสงค์:
 * กำหนดประเภทวิธีการชำระเงิน
 *
 * หมายเหตุ:
 * ค่านี้ใช้ในระบบตรวจสอบว่าเปิดช่องทางไหนบ้าง
 */
export type PaymentMethod = "Credit Card" | "Bank Transfer" | "Cash On Delivery";
export type PaymentMethodArray = [PaymentMethod, ...PaymentMethod[]];