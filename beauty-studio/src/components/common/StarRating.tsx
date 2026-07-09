/*
==================================================

ไฟล์: StarRating.tsx

ตำแหน่ง: src/components/common/

หน้าที่:
แสดงดาวให้คะแนนสินค้า (1-5 ดาว)
ใช้ร่วมกับ ProductCard และ ProductDetail

รับผิดชอบ:
- แสดงดาวเต็ม/ว่างตามคะแนนที่ได้รับ
- รองรับการปัดเศษคะแนน

ใช้งานร่วมกับ:
- ProductCard
- ProductDetail
- AdminPanel (Reviews)

Export:
- renderStars

หมายเหตุ:
- ไม่มี Props อื่นนอกจาก rating
- ใช้ unicode สำหรับสัญลักษณ์ดาว
- ปัดเศษตามหลักคณิตศาสตร์ (Math.round)

==================================================
*/

// ======================================================
// Imports
// นำเข้า Library และ Component ที่จำเป็น
// ======================================================

/**
 * จุดประสงค์:
 * แสดงดาวให้คะแนนสินค้า
 *
 * การทำงาน:
 * สร้าง Array ขนาด 5 แล้ว map เป็น <span>
 * ถ้าดาวดัชนีน้อยกว่าคะแนนที่ปัดเศษแล้วจะเติมสี
 *
 * Parameter:
 * rating (number) - คะแนนสินค้า 0-5
 *
 * Return:
 * React.ReactNode - Array ของ <span> element
 *
 * หมายเหตุ:
 * ใช้ Math.round เพื่อปัดเศษคะแนน
 * ดาวที่เติมสีใช้ class "star filled"
 */
export function renderStars(rating: number): React.ReactNode {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`star ${i < Math.round(rating) ? "filled" : ""}`}
    >
      {"\u2605"}
    </span>
  ));
}