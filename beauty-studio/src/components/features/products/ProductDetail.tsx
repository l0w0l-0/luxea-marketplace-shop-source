/*
==================================================
ไฟล์: components/features/products/ProductDetail.tsx

หน้าที่:
แสดงรายละเอียดสินค้าแบบเต็ม

ใช้สำหรับ:
- หน้า Product Detail

ทำงานร่วมกับ:
- BeautyShopApp
- ProductVisual
- Product, Review Types
- Utils (getImageSrc)
- renderStars

หมายเหตุ:
มีส่วนรีวิวสินค้าด้านล่าง
==================================================
*/

"use client";

import { useState } from "react";
import { Product, Review } from "@/src/types";
import { getImageSrc } from "@/src/utils";
import { renderStars } from "@/src/components/common/StarRating";

/**
 * หน้ารายละเอียดสินค้า
 *
 * จุดประสงค์: แสดงข้อมูลสินค้าครบถ้วน, เลือกสี, เลือกจำนวน, และรีวิว
 * Input: product, onAddToCart, onBuyNow, onToggleWishlist, isWishlisted, reviews, onBack
 * Output: JSX Element
 */
export function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  reviews,
  onBack,
}: {
  product: Product;
  onAddToCart: (p: Product, c: string) => void;
  onBuyNow?: (p: Product, c: string, quantity: number) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  reviews: Review[];
  onBack: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0].id,
  );
  const [quantity, setQuantity] = useState(1);
  const selectedColorOption =
    product.colors.find((color) => color.id === selectedColor) ?? product.colors[0];

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-4 hover:opacity-80"
        >
          {"\u2190"} กลับ
        </button>
        <div className="glass-xl rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--color-primary-50)] to-white p-6">
          <div className="relative w-full h-96 rounded-[var(--radius-xl)] overflow-hidden">
            <div
              className="absolute inset-0 opacity-25"
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.32),transparent_45%),linear-gradient(180deg,transparent_18%,rgba(58,46,46,0.08)_100%)]" />
          </div>
        </div>
      </div>

      <aside className="space-y-6 self-start lg:sticky lg:top-24">
        <div className="glass-xl rounded-[var(--radius-2xl)] p-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
              {product.category}
            </p>
            <button
              className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
              onClick={() => onToggleWishlist(product.id)}
            >
              {isWishlisted ? "\u2764\uFE0F" : "\uD83E\uDD0D"}
            </button>
          </div>

          <h1 className="text-4xl font-display text-[var(--color-text)] mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {product.rating} ({product.reviewCount} reviews)
            </span>
            {product.isPremium && (
              <span className="badge-premium">{"\u2728"} Premium</span>
            )}
          </div>

          <p className="text-3xl font-black text-[var(--color-primary)] mb-6">
            {"\u0E3F"}{product.price}
          </p>

          <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--color-primary)] mb-3">
              สี ({product.shade})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                    selectedColor === c.id
                      ? "border-[var(--color-primary)] bg-[linear-gradient(135deg,rgba(163,93,106,0.10),rgba(255,255,255,0.96))] shadow-[0_16px_34px_rgba(163,93,106,0.14)]"
                      : "border-[var(--color-border)] bg-white/82 hover:border-[rgba(163,93,106,0.26)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full shadow-md"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {c.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {c.hex}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[var(--color-text-secondary)]">
                    <span>{c.undertone ?? "Neutral"}</span>
                    <span>{c.finish ?? "Soft"}</span>
                    <span>{c.coverage ?? "Medium"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-primary-50)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Selected Shade
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span
                className="mt-1 h-4 w-4 rounded-full shadow-sm"
                style={{ backgroundColor: selectedColorOption.hex }}
              />
              <div>
                <p className="text-base font-bold text-[var(--color-text)]">
                  {selectedColorOption.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {selectedColorOption.hex} {"\u00B7"} {selectedColorOption.undertone ?? "Neutral"} {"\u00B7"}{" "}
                  {selectedColorOption.finish ?? "Matte"} {"\u00B7"}{" "}
                  {selectedColorOption.coverage ?? "Medium"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--color-primary)] mb-3">
              จำนวน
            </h3>
            <div className="flex items-center gap-3 glass p-3 rounded-[var(--radius-lg)] w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="btn btn-secondary w-10 h-10 p-0"
              >
                -
              </button>
              <span className="text-xl font-bold min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="btn btn-secondary w-10 h-10 p-0"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              className="btn btn-primary w-full text-lg h-14"
              disabled={product.stock === 0}
              onClick={() => {
                for (let i = 0; i < quantity; i++) {
                  onAddToCart(product, selectedColor);
                }
              }}
            >
              {product.stock === 0 ? "สินค้าหมด" : "หยิบใส่ตะกร้า"}
            </button>
            <button
              className="btn btn-secondary w-full text-lg h-14"
              disabled={product.stock === 0}
              onClick={() => onBuyNow?.(product, selectedColor, quantity)}
            >
              ซื้อตอนนี้
            </button>
          </div>
        </div>

        <div className="glass-xl rounded-[var(--radius-2xl)] p-8">
          <h2 className="text-2xl font-display text-[var(--color-primary)] mb-6">
            รีวิวลูกค้า ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-[var(--color-text-secondary)]">
              ยังไม่มีรีวิวสำหรับสินค้านี้
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-200)] to-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-text)]">
                          {review.userName}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {review.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}