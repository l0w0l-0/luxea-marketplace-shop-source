/*
==================================================

ไฟล์: index.ts

ตำแหน่ง: src/utils/

หน้าที่:
รวม Utility Functions ทั้งหมดของระบบ LUXEA Beauty Shop
เป็น Pure Functions ที่ไม่มี Side Effects

รับผิดชอบ:
- จัดการรูปแบบเงินและสกุลเงิน
- จัดการรูปภาพ (URL normalization, proxy)
- จัดการ HTML Escaping ป้องกัน XSS
- จัดการดาวน์โหลดไฟล์
- จัดการสถานะออเดอร์
- คำนวณราคา ส่วนลด และค่าจัดส่ง
- คำนวณแต้มสะสม

ใช้งานร่วมกับ:
- ทุก Component ในระบบ
- Services
- API Routes

Export:
- formatMoney, formatOrderStatus
- normalizeImageUrl, getImageSrc
- downloadTextFile, escapeHtml
- calculateCartTotals, calculateCartSummary
- calculateLoyaltyPoints, isLowStock, calculateAvailableQuantity

หมายเหตุ:
- ทุกฟังก์ชันเป็น Pure Function
- ไม่มีการเรียก API หรือ Side Effects
- รองรับการทดสอบ Unit Test ได้ง่าย

==================================================
*/

// ======================================================
// Imports
// นำเข้า Library และ Module ที่จำเป็น
// ======================================================

// ======================================================
// ฟังก์ชันจัดรูปแบบเงิน (Money Formatting)
// แปลงตัวเลขเป็นรูปแบบสกุลเงินบาทไทย
// ======================================================

/**
 * จุดประสงค์:
 * แปลงตัวเลขเป็นรูปแบบเงินบาทไทย
 *
 * การทำงาน:
 * ใช้ toLocaleString เพื่อจัดรูปแบบตัวเลขตาม locale th-TH
 * และเติมสัญลักษณ์สกุลเงินบาท (฿) ด้านหน้า
 *
 * Parameter:
 * amount (number) - จำนวนเงินที่ต้องการจัดรูปแบบ
 *
 * Return:
 * string - ข้อความรูปแบบเงิน เช่น "฿1,234"
 *
 * หมายเหตุ:
 * รองรับเฉพาะภาษาไทย (th-TH)
 * หากต้องการสกุลเงินอื่นต้องแก้ไข locale
 */
export function formatMoney(amount: number): string {
  return `฿${amount.toLocaleString("th-TH")}`;
}

// ======================================================
// ฟังก์ชันสถานะออเดอร์ (Order Status)
// แปลงสถานะออเดอร์ภาษาอังกฤษเป็นภาษาไทย
// ======================================================

/**
 * จุดประสงค์:
 * แปลงสถานะออเดอร์จากภาษาอังกฤษเป็นภาษาไทย
 *
 * การทำงาน:
 * ใช้ Object Mapping เพื่อแปลงค่า status
 * หากไม่พบใน Map จะคืนค่า "ยกเลิก" เป็นค่าเริ่มต้น
 *
 * Parameter:
 * status - สถานะออเดอร์ (paid, waiting_payment, cod, processing, shipped, completed, cancelled)
 *
 * Return:
 * string - ข้อความสถานะภาษาไทย
 *
 * หมายเหตุ:
 * ใช้ Nullish Coalescing (??) เพื่อป้องกัน undefined
 */
export function formatOrderStatus(
  status:
    | "paid"
    | "waiting_payment"
    | "cod"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled",
): string {
  const statusMap: Record<string, string> = {
    waiting_payment: "รอชำระ",
    paid: "ชำระแล้ว",
    cod: "ปลายทาง",
    processing: "กำลังเตรียมของ",
    shipped: "จัดส่งแล้ว",
    completed: "สำเร็จ",
    cancelled: "ยกเลิก",
  };
  return statusMap[status] ?? "ยกเลิก";
}

// ======================================================
// ฟังก์ชันรูปภาพ (Image Utilities)
// จัดการ URL รูปภาพให้พร้อมใช้งาน
// ======================================================

/**
 * จุดประสงค์:
 * ทำให้ URL รูปภาพเป็นมาตรฐาน
 *
 * การทำงาน:
 * แก้ไข URL ที่มีข้อความ "text-to-image" เป็น "text_to_image"
 * เพื่อให้สอดคล้องกับระบบ Proxy รูปภาพ
 *
 * Parameter:
 * url (string) - URL รูปภาพที่ต้องการ normalize
 *
 * Return:
 * string - URL ที่ถูกแก้ไขแล้ว
 *
 * หมายเหตุ:
 * ถ้า url เป็นค่าว่างจะคืนค่าเดิม
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  return url.replaceAll("text-to-image", "text_to_image");
}

/**
 * จุดประสงค์:
 * ดึง URL รูปภาพที่ถูกต้องสำหรับแสดงผล
 *
 * การทำงาน:
 * 1. Normalize URL ก่อน
 * 2. ถ้าเป็น path สัมพัทธ์ (ขึ้นต้นด้วย /) คืนค่าเดิม
 * 3. ถ้าไม่ใช่ HTTP/HTTPS คืนค่าเดิม
 * 4. ถ้าเป็น HTTPS จะเปลี่ยนเป็น Proxy /api/image
 *
 * Parameter:
 * url (string) - URL รูปภาพ
 *
 * Return:
 * string - URL ที่พร้อมแสดงผล
 *
 * หมายเหตุ:
 * การใช้ Proxy ช่วยป้องกัน CORS และเพิ่มความปลอดภัย
 */
export function getImageSrc(url: string): string {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return normalized;
  if (normalized.startsWith("/")) return normalized;
  if (!/^https?:\/\//.test(normalized)) return normalized;
  return `/api/image?url=${encodeURIComponent(normalized)}`;
}

// ======================================================
// ฟังก์ชันดาวน์โหลดไฟล์ (File Download)
// สร้างและดาวน์โหลดไฟล์จากข้อความ
// ======================================================

/**
 * จุดประสงค์:
 * ดาวน์โหลดไฟล์ข้อความจาก Browser
 *
 * การทำงาน:
 * 1. สร้าง Blob จาก content และ mime type
 * 2. สร้าง Object URL
 * 3. สร้าง element <a> สำหรับดาวน์โหลด
 * 4. คลิกอัตโนมัติและล้างข้อมูล
 *
 * Parameter:
 * filename (string) - ชื่อไฟล์ที่จะบันทึก
 * content (string) - เนื้อหาของไฟล์
 * mime (string) - MIME type (เช่น text/csv)
 *
 * Return:
 * void - เริ่มการดาวน์โหลดไฟล์
 *
 * หมายเหตุ:
 * ใช้ Browser API เท่านั้น ไม่ทำงานบน Server
 * ต้องล้าง Object URL เพื่อป้องกัน memory leak
 */
export function downloadTextFile(
  filename: string,
  content: string,
  mime: string,
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ======================================================
// ฟังก์ชัน HTML Escaping
// ป้องกัน XSS โดยการ Escape HTML Special Characters
// ======================================================

/**
 * จุดประสงค์:
 * ป้องกันการโจมตี XSS โดยการ Escape HTML
 *
 * การทำงาน:
 * แทนที่อักขระพิเศษ HTML ด้วย HTML Entities
 * & → &  < → <  > → >  " → "  ' → &#039;
 *
 * Parameter:
 * value (string) - ข้อความที่ต้องการ escape
 *
 * Return:
 * string - ข้อความที่ปลอดภัยสำหรับแสดงใน HTML
 *
 * หมายเหตุ:
 * ใช้ String Concatenation เพื่อหลีกเลี่ยง Auto-formatting
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/[&]/g, () => "\x26" + "amp;")
    .replace(/[<]/g, () => "\x26" + "lt;")
    .replace(/[>]/g, () => "\x26" + "gt;")
    .replace(/["]/g, () => "\x26" + "quot;")
    .replace(/[']/g, () => "\x26" + "#039;");
}

// ======================================================
// ฟังก์ชันคำนวณ (Calculation Utilities)
// คำนวณราคา ส่วนลด ค่าจัดส่ง และแต้มสะสม
// ======================================================

/**
 * จุดประสงค์:
 * คำนวณยอดรวมตะกร้าสินค้า
 *
 * การทำงาน:
 * 1. คำนวณ subtotal จากราคา * จำนวน
 * 2. คำนวณ itemCount
 * 3. หักส่วนลด
 * 4. คำนวณค่าจัดส่งตามเงื่อนไข
 * 5. คืนค่ายอดรวมสุทธิ
 *
 * Parameter:
 * args.items - รายการสินค้า (unitPrice, quantity)
 * args.discount - ส่วนลด (ไม่บังคับ)
 * args.freeShippingThreshold - ยอดขั้นต่ำส่งฟรี (ไม่บังคับ)
 * args.shippingFee - ค่าส่ง (ไม่บังคับ)
 *
 * Return:
 * { itemCount, subtotal, discount, shipping, total }
 *
 * หมายเหตุ:
 * shipping = 0 เมื่อ subtotal >= freeShippingThreshold
 * shipping = 0 เมื่อ itemCount === 0
 */
export function calculateCartTotals(args: {
  items: Array<{ unitPrice: number; quantity: number }>;
  discount?: number;
  freeShippingThreshold?: number;
  shippingFee?: number;
}) {
  const subtotal = args.items.reduce((sum, item) => {
    const quantity = Math.max(0, Math.floor(item.quantity));
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    return sum + unitPrice * quantity;
  }, 0);

  const itemCount = args.items.reduce(
    (sum, item) => sum + Math.max(0, Math.floor(item.quantity)),
    0,
  );
  const discount = Math.max(0, Math.floor(args.discount ?? 0));
  const freeShippingThreshold = args.freeShippingThreshold ?? 699;
  const shippingFee = args.shippingFee ?? 50;
  const shipping =
    itemCount === 0
      ? 0
      : subtotal >= freeShippingThreshold
        ? 0
        : Math.max(0, Math.floor(shippingFee));

  return {
    itemCount,
    subtotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount) + shipping,
  };
}

/**
 * จุดประสงค์:
 * คำนวณยอดรวมตะกร้าพร้อมคูปองส่วนลด
 *
 * การทำงาน:
 * 1. คำนวณ subtotal จากสินค้าในตะกร้า
 * 2. คำนวณส่วนลดตามประเภทคูปอง
 * 3. เรียก calculateCartTotals เพื่อคำนวณยอดรวม
 *
 * Parameter:
 * args.cart - รายการสินค้าในตะกร้า
 * args.products - ข้อมูลสินค้าทั้งหมด
 * args.coupon - คูปองส่วนลด (null ถ้าไม่มี)
 * args.settings - การตั้งค่าร้านค้า
 *
 * Return:
 * { quantity, total, discount, shipping, grandTotal }
 *
 * หมายเหตุ:
 * LUXEA10 ลด 10% สูงสุด 200 บาท
 * FREESHIP ยกเว้นค่าจัดส่ง
 */
export function calculateCartSummary(args: {
  cart: Array<{ productId: string; colorId: string; quantity: number }>;
  products: Array<{ id: string; price: number }>;
  coupon: { code: string; kind: string } | null;
  settings: { freeShippingThreshold: number; shippingFee: number };
}) {
  const subtotal = args.cart.reduce((sum, item) => {
    const product = args.products.find((entry) => entry.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const quantity = args.cart.reduce((sum, item) => sum + item.quantity, 0);
  const discount =
    args.coupon?.kind === "percent10"
      ? Math.min(200, Math.round(subtotal * 0.1))
      : 0;
  const totals = calculateCartTotals({
    items: args.cart.map((item) => {
      const product = args.products.find((entry) => entry.id === item.productId);
      return {
        unitPrice: product?.price ?? 0,
        quantity: item.quantity,
      };
    }),
    discount,
    freeShippingThreshold: args.settings.freeShippingThreshold,
    shippingFee:
      args.coupon?.kind === "freeship" ? 0 : args.settings.shippingFee,
  });

  return {
    quantity: totals.itemCount,
    total: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    grandTotal: totals.total,
  };
}

/**
 * จุดประสงค์:
 * คำนวณแต้มสะสมจากยอดสั่งซื้อ
 *
 * การทำงาน:
 * ทุก loyaltyPointUnitBaht บาท จะได้ 1 แต้ม
 * ปัดเศษลงเสมอ
 *
 * Parameter:
 * orderTotal (number) - ยอดสั่งซื้อ
 * loyaltyPointUnitBaht (number) - จำนวนเงินต่อ 1 แต้ม (ค่าเริ่มต้น 100)
 *
 * Return:
 * number - จำนวนแต้มที่ได้รับ
 */
export function calculateLoyaltyPoints(
  orderTotal: number,
  loyaltyPointUnitBaht: number = 100,
): number {
  const unit = Math.max(1, Math.floor(loyaltyPointUnitBaht));
  return Math.floor(Math.max(0, Number(orderTotal) || 0) / unit);
}

/**
 * จุดประสงค์:
 * ตรวจสอบว่าสินค้าใกล้หมดหรือไม่
 *
 * การทำงาน:
 * เปรียบเทียบสต็อกกับเกณฑ์ที่กำหนด
 * ถ้าสต็อกน้อยกว่าหรือเท่ากับเกณฑ์ คืนค่า true
 *
 * Parameter:
 * stockQty (number) - จำนวนสต็อกปัจจุบัน
 * lowStockThreshold (number) - เกณฑ์ขั้นต่ำ (ค่าเริ่มต้น 10)
 *
 * Return:
 * boolean - true ถ้าสินค้าใกล้หมด
 */
export function isLowStock(
  stockQty: number,
  lowStockThreshold: number = 10,
): boolean {
  return Math.floor(stockQty) <= Math.max(0, Math.floor(lowStockThreshold));
}

/**
 * จุดประสงค์:
 * คำนวณจำนวนสินค้าที่สามารถซื้อได้
 *
 * การทำงาน:
 * หักสต็อกที่จองไว้ออกจากสต็อกทั้งหมด
 * ป้องกันการจองเกินสต็อก
 *
 * Parameter:
 * stockQty (number) - สต็อกทั้งหมด
 * reservedQty (number) - จำนวนที่จองไว้ (ค่าเริ่มต้น 0)
 *
 * Return:
 * number - จำนวนที่สามารถซื้อได้
 */
export function calculateAvailableQuantity(
  stockQty: number,
  reservedQty: number = 0,
): number {
  return Math.max(0, Math.floor(stockQty) - Math.floor(reservedQty));
}