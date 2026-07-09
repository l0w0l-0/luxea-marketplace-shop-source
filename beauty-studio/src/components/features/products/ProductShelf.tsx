/*
==================================================
ไฟล์: components/features/products/ProductShelf.tsx

หน้าที่:
แสดงรายการสินค้าในรูปแบบ Grid

ใช้สำหรับ:
- หน้า Home
- หน้า Shop

ทำงานร่วมกับ:
- ProductCard
- Product Types

หมายเหตุ:
มี animation แบบ stagger children
==================================================
*/

"use client";

import { motion } from "framer-motion";
import { Product } from "@/src/types";
import { ProductCard } from "./ProductCard";

/**
 * ชั้นวางสินค้า
 *
 * จุดประสงค์: แสดงรายการสินค้าในรูปแบบ Grid พร้อม animation
 * Input: title, products, onAddToCart, onToggleWishlist, wishlist, renderStars, onViewProduct
 * Output: JSX Element
 */
export function ProductShelf({
  title = "สินค้า",
  products,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  renderStars,
  onViewProduct,
}: {
  title?: string;
  products: Product[];
  onAddToCart: (p: Product, c: string) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
  renderStars: (r: number) => React.ReactNode;
  onViewProduct?: (p: Product) => void;
}) {
  return (
    <section className="glass-xl p-7">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {products.length} รายการ
          </p>
        </div>
        <div className="text-sm font-bold text-[var(--color-text-secondary)] hidden sm:block">
          เลือกสี {"\u00B7"} หยิบใส่ตะกร้า {"\u00B7"} ชำระเงิน
        </div>
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
              renderStars={renderStars}
              onViewProduct={onViewProduct}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}