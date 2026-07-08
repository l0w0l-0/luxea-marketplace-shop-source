/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * เฉดสีของสินค้าเครื่องสำอาง
 */
export interface ProductColor {
  id: string;      // ไอดีเฉพาะของสี
  name: string;    // ชื่อสี (เช่น Rosy Pink)
  hex: string;     // รหัสสี Hex (เช่น #D96483)
  undertone?: string; // โทนผิวใต้ผิว (เช่น Cool, Warm, Neutral)
  finish?: string;    // เนื้อผลิตภัณฑ์ (เช่น Matte, Satin, Shimmer)
  coverage?: string;  // ระดับการปกปิด (เช่น Medium, Full)
  stock: number;      // จำนวนคงเหลือในคลังเฉพาะสีนี้
}

/**
 * รายละเอียดของสินค้าทั้งหมดในระบบ
 */
export interface Product {
  id: string;          // ไอดีสินค้า
  name: string;        // ชื่อสินค้า
  category: string;    // หมวดหมู่สินค้า (เช่น Lipstick, Blush)
  shade: string;       // เฉดสีเริ่มต้น
  price: number;       // ราคาสินค้า (บาท)
  stock: number;       // สต็อกรวมของสินค้า (ผลรวมของสีทั้งหมด)
  rating: number;      // คะแนนเฉลี่ยของสินค้า (เช่น 4.9)
  reviewCount: number; // จำนวนรีวิวทั้งหมด
  color: string;       // รหัสสีหลักสำหรับการตกแต่ง UI
  description: string; // คำอธิบายสินค้า
  image: string;       // URL รูปภาพสินค้า
  colors: ProductColor[]; // เฉดสีทั้งหมดที่มีจำหน่าย
  isPremium?: boolean; // ระบุว่าเป็นสินค้าพรีเมียมหรือไม่
  status?: "draft" | "published"; // สถานะการจำหน่าย
  tags?: Array<"Premium" | "New" | "Best Seller">; // แท็กสำหรับจัดหมวดหมู่พิเศษ
  sortOrder?: number;  // ลำดับการแสดงผล
}

/**
 * ข้อมูลผู้ใช้งานระบบ
 */
export interface User {
  id: string;       // ไอดีผู้ใช้งาน
  name: string;     // ชื่อผู้ใช้งาน
  email: string;    // อีเมลผู้ใช้งาน
  role: "customer" | "admin"; // บทบาทของยูสเซอร์ (ลูกค้า หรือ ผู้ดูแลระบบ)
  tier: "Member" | "VIP";     // ระดับสมาชิกเพื่อรับสิทธิพิเศษ
  points: number;   // คะแนนสะสม
}

/**
 * สินค้าในตะกร้าช้อปปิ้ง
 */
export interface CartItem {
  productId: string; // ไอดีสินค้า
  colorId: string;   // ไอดีสีที่เลือก
  quantity: number;  // จำนวนสินค้าที่หยิบใส่ตะกร้า
}

/**
 * ข้อมูลคำสั่งซื้อ (Orders)
 */
export interface Order {
  id: string;           // ไอดีคำสั่งซื้อ (ORD-xxx)
  customerName: string; // ชื่อลูกค้าที่สั่งซื้อ
  items: Array<{
    productId: string;  // ไอดีสินค้า
    colorId: string;    // ไอดีสี
    name: string;       // ชื่อสินค้า (รวมเฉดสี)
    quantity: number;   // จำนวนที่สั่งซื้อ
    price: number;      // ราคาสินค้า ณ ตอนสั่งซื้อ
  }>;
  shippingName: string;    // ชื่อผู้รับพัสดุ
  shippingPhone: string;   // เบอร์โทรศัพท์ผู้รับ
  shippingAddress: string; // ที่อยู่จัดส่งพัสดุ
  shippingMethod: "standard"; // วิธีการจัดส่ง
  trackingNumber?: string; // เลขพัสดุติดตามสถานะ
  trackingUrl?: string;    // ลิงก์ติดตามพัสดุ
  subtotal: number;        // ยอดรวมสินค้าก่อนหักส่วนลด
  discount: number;        // ส่วนลดที่ได้รับ
  shippingFee: number;     // ค่าบริการจัดส่ง
  total: number;           // ยอดรวมสุทธิที่ต้องชำระ
  couponCode?: string;     // โค้ดส่วนลดที่ใช้
  paymentMethod: string;   // ช่องทางการชำระเงิน (เช่น Credit Card, Bank Transfer)
  status:
    | "paid"               // ชำระเงินเรียบร้อย
    | "waiting_payment"    // รอการชำระเงิน (กรณีโอนธนาคาร)
    | "cod"                // ชำระเงินปลายทาง
    | "processing"         // กำลังจัดเตรียมพัสดุ
    | "shipped"            // จัดส่งเรียบร้อยแล้ว
    | "completed"          // ลูกค้าได้รับสินค้าแล้ว/คำสั่งซื้อเสร็จสิ้น
    | "cancelled";         // คำสั่งซื้อถูกยกเลิก
  createdAt: string;       // วันเวลาที่สร้างออเดอร์
}

/**
 * ข้อมูลรีวิวสินค้าจากผู้ใช้งาน
 */
export interface Review {
  id: string;         // ไอดีรีวิว
  userId: string;     // ไอดีผู้ใช้งานที่รีวิว
  userName: string;   // ชื่อผู้ใช้งานที่รีวิว
  productId: string;  // ไอดีสินค้าที่ได้รับรีวิว
  rating: number;     // คะแนนที่มอบให้ (1-5 ดาว)
  comment: string;    // ความคิดเห็นเพิ่มเติม
  skinTone?: string;  // โทนผิวของผู้รีวิว (ช่วยให้ผู้ใช้อื่นเลือกเฉดสีได้ง่ายขึ้น)
  createdAt: string;  // วันที่เขียนรีวิว
  status?: "approved" | "pending" | "hidden"; // สถานะการแสดงผล
}

/**
 * รูปแบบของคูปองโค้ดส่วนลด
 */
export type Coupon =
  | { code: "LUXEA10"; kind: "percent10" } // คูปองลด 10%
  | { code: "FREESHIP"; kind: "freeship" }; // คูปองจัดส่งฟรี

/**
 * การตั้งค่าข้อมูลทั่วไปของร้านค้า (Store Settings)
 */
export interface StoreSettings {
  freeShippingThreshold: number; // เกณฑ์ยอดซื้อขั้นต่ำเพื่อส่งฟรี (บาท)
  shippingFee: number;           // ค่าส่งเริ่มต้น (บาท)
  lowStockThreshold: number;     // เกณฑ์ในการแจ้งเตือนสินค้าสต็อกต่ำ
  enabledPaymentMethods: Array<
    "Credit Card" | "Bank Transfer" | "Cash On Delivery"
  >; // ช่องทางการชำระเงินที่เปิดให้บริการ
}

/**
 * ข้อมูลการเคลื่อนไหวของคลังสินค้า (Stock Movements Audit Logs)
 */
export interface StockMovement {
  id: string;           // ไอดีประวัติ
  createdAt: string;    // วันและเวลาที่เกิดการทำรายการ
  productId: string;    // ไอดีสินค้า
  productName: string;  // ชื่อสินค้า
  colorId?: string;     // ไอดีสี (ถ้ามี)
  colorName?: string;   // ชื่อสี (ถ้ามี)
  delta: number;        // จำนวนที่เปลี่ยนแปลง (+ เพื่อเพิ่มสต็อก, - เพื่อลดสต็อก)
  reason: "manual_adjust" | "order_checkout"; // เหตุผลการเปลี่ยนสต็อก (ปรับเอง หรือ สั่งซื้อสินค้า)
  actor: string;        // ผู้ทำรายการ (เช่น Admin, ชื่อลูกค้า)
  note?: string;        // หมายเหตุ/เลขออเดอร์ที่อ้างอิง
}
