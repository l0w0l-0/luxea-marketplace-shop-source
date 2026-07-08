/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Product } from "../types";
import { getImageSrc, formatMoney } from "../shared/commerce";

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (p: Product, colorId: string) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  renderStars: (r: number) => React.ReactNode;
  onViewProduct?: (p: Product) => void;
}

/**
 * รูปภาพจำลองเนื้อแป้งหรือภาพถ่ายเครื่องสำอาง (Product Visual Area)
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
        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
    </div>
  );
}

/**
 * การ์ดแสดงรายการสินค้าเครื่องสำอางแต่ละรายการ (Product Grid Card)
 * มาพร้อมฟังก์ชันเลือกเฉดสี (Color Swatches) เพื่อดูรายละเอียด/สต็อกรายสี และหยิบลงตะกร้าได้ทันที
 */
export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  renderStars,
  onViewProduct,
}: ProductCardProps) {
  
  // จัดเก็บเฉดสีที่ผู้ใช้เลือก (Default เป็นเฉดแรกของสินค้า)
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].id : ""
  );

  const selectedColorOption =
    product.colors.find((color) => color.id === selectedColor) ?? product.colors[0];

  // เตรียม Badge พิเศษตามข้อมูลสินค้า
  const badges = (() => {
    const list: Array<{ label: string; tone: "primary" | "soft" | "neutral" }> = [];
    const tagList = product.tags ?? [];
    if (tagList.includes("Best Seller")) list.push({ label: "Best Seller", tone: "primary" });
    if (tagList.includes("New")) list.push({ label: "New", tone: "soft" });
    if (product.stock > 0 && product.stock <= 10) list.push({ label: "Limited", tone: "neutral" });
    if (tagList.includes("Premium") || product.isPremium) list.push({ label: "Premium", tone: "neutral" });
    return list.slice(0, 2); // จำกัดการแสดงผลไม่เกิน 2 ป้ายเพื่อความสวยงาม
  })();

  return (
    <motion.article
      className="product-card group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* ส่วน Visual/รูปภาพ และปุ่ม Wishlist ลอย */}
      <div
        className="relative cursor-pointer"
        onClick={() => onViewProduct && onViewProduct(product)}
      >
        <ProductVisual product={product} />
        
        {/* แสดงป้ายแท็กซ้ายบน */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.label}
              className={
                b.tone === "primary"
                  ? "inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[var(--color-primary)] border border-white/70 shadow-sm"
                  : b.tone === "soft"
                    ? "inline-flex items-center rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[var(--color-text)] border border-white/60 shadow-sm"
                    : "inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-bold text-[var(--color-text)] border border-[var(--color-border)] shadow-sm"
              }
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* ปุ่มลอยรูปหัวใจเซฟใส่ลิสต์โปรด */}
        <button
          type="button"
          className={`wishlist-btn absolute top-4 right-4 cursor-pointer z-10 ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      {/* รายละเอียดสินค้าด้านล่าง */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
            {product.category}
          </p>
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="text-xs text-[var(--color-text-secondary)] font-bold ml-1">
              {product.rating.toFixed(1)} · {product.reviewCount} รีวิว
            </span>
          </div>
        </div>

        <p
          className="mt-3 text-lg font-bold cursor-pointer leading-snug hover:text-[var(--color-primary)] transition"
          onClick={() => onViewProduct && onViewProduct(product)}
        >
          {product.name}
        </p>

        {/* กล่องเลือกเฉดสี (Color Swatches) */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex min-w-max gap-2">
              {product.colors.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`shade-chip cursor-pointer ${c.id === selectedColor ? "active" : ""}`}
                  title={c.name}
                >
                  <span
                    className="shade-swatch"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden="true"
                  />
                  <span className="shade-meta">
                    <strong>{c.name}</strong>
                    <span>{c.finish ?? c.undertone ?? "Beauty Tone"}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <p className="shrink-0 rounded-full bg-white/80 border border-[var(--color-border)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] shadow-sm">
            {product.stock > 0 ? `เหลือ ${product.stock} ชิ้น` : "สินค้าหมด"}
          </p>
        </div>

        {/* รายละเอียดสเปกเฉพาะสีที่เลือก */}
        {selectedColorOption && (
          <div
            className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 shadow-sm transition-all"
            style={{
              background:
                "linear-gradient(180deg, rgba(249, 241, 243, 0.95), rgba(255, 255, 255, 0.82))",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[var(--color-text)]">
                {selectedColorOption.name}
              </p>
              <span className="text-xs font-semibold text-[var(--color-primary)]">
                {selectedColorOption.hex}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-medium">
              {selectedColorOption.undertone ?? "Neutral"} Undertone ·{" "}
              {selectedColorOption.finish ?? "Soft Finish"}
            </p>
          </div>
        )}

        {/* ส่วนราคาและปุ่มกดสั่งซื้อ */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="price-pill">
            <p className="text-2xl font-black text-[var(--color-primary)]">
              {formatMoney(product.price)}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary h-11 px-5 cursor-pointer"
            disabled={product.stock === 0}
            onClick={() => onAddToCart(product, selectedColor)}
          >
            ใส่ตะกร้า
          </button>
        </div>
      </div>
    </motion.article>
  );
}
