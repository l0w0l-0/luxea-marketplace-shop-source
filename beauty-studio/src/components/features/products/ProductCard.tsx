"use client";
import { motion } from "framer-motion";

import { useState } from "react";
import type { JSX } from "react";
import type { Product } from "@/src/types";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  renderStars,
  onViewProduct,
}: {
  product: Product;
  onAddToCart: (p: Product, c: string) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  renderStars: (r: number) => JSX.Element[];
  onViewProduct?: (p: Product) => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0].id,
  );
  const selectedColorOption =
    product.colors.find((color) => color.id === selectedColor) ?? product.colors[0];

  const badges = (() => {
    const list: Array<{ label: string; tone: "primary" | "soft" | "neutral" }> =
      [];
    const tagList = product.tags ?? [];
    if (tagList.includes("Best Seller")) list.push({ label: "Best Seller", tone: "primary" });
    if (tagList.includes("New")) list.push({ label: "New", tone: "soft" });
    if (product.stock > 0 && product.stock <= 10) list.push({ label: "Limited", tone: "neutral" });
    if (tagList.includes("Premium") || product.isPremium) list.push({ label: "Premium", tone: "neutral" });
    return list.slice(0, 2);
  })();

  return (
    <motion.article
      className="product-card group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div
        className="relative cursor-pointer"
        onClick={() => onViewProduct && onViewProduct(product)}
      >
        <ProductVisual product={product} />
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
        <button
          className={`wishlist-btn absolute top-4 right-4 ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
            {product.category}
          </p>
          <div className="flex items-center gap-2">
            {renderStars(product.rating)}
            <span className="text-xs text-[var(--color-text-secondary)]">
              {product.rating.toFixed(1)} · {product.reviewCount}
            </span>
          </div>
        </div>

        <p
          className="mt-2 text-lg font-bold cursor-pointer leading-snug"
          onClick={() => onViewProduct && onViewProduct(product)}
        >
          {product.name}
        </p>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {product.colors.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`shade-chip ${c.id === selectedColor ? "active" : ""}`}
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
          <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)] shadow-sm">
            {product.stock > 0 ? `เหลือ ${product.stock}` : "หมดสต็อก"}
          </p>
        </div>

        <div
          className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 shadow-sm"
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
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {selectedColorOption.undertone ?? "Neutral"} ·{" "}
            {selectedColorOption.finish ?? "Soft Finish"}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="price-pill">
            <p className="text-2xl font-black text-[var(--color-primary)]">
              ฿{product.price}
            </p>
          </div>
          <button
            className="btn btn-primary h-11 px-5"
            disabled={product.stock === 0}
            onClick={() => onAddToCart(product, selectedColor)}
          >
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </motion.article>
  );
}

