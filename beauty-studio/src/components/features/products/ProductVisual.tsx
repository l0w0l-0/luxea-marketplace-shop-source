/*
==================================================
ไฟล์: components/features/products/ProductVisual.tsx

หน้าที่:
แสดงรูปภาพสินค้าในรูปแบบ Visual Card

ใช้สำหรับ:
- ProductCard
- ProductDetail

ทำงานร่วมกับ:
- Product Types
- Utils (getImageSrc)

หมายเหตุ:
มี fallback เมื่อรูปภาพโหลดไม่สำเร็จ
==================================================
*/

"use client";

import { Product } from "@/src/types";
import { getImageSrc } from "@/src/utils";

/**
 * แสดงรูปภาพสินค้า
 *
 * จุดประสงค์: แสดงรูปภาพสินค้าพร้อม gradient overlay
 * Input: product (Product)
 * Output: JSX Element
 */
export function ProductVisual({ product }: { product: Product }) {
  return (
    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-neutral)]">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: product.color }}
      />
      <img
        src={getImageSrc(product.image)}
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
    </div>
  );
}