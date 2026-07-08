/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Product } from "../types";
import ProductCard from "./ProductCard";

interface ProductShelfProps {
  title?: string;
  products: Product[];
  onAddToCart: (p: Product, colorId: string) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
  renderStars: (r: number) => React.ReactNode;
  onViewProduct?: (p: Product) => void;
}

/**
 * แผงชั้นวางสินค้า (Product Shelf Showcase)
 * แสดงสินค้าแบบ Grid ตกแต่งพื้นหลังอย่างหรูหรา และรองรับ Staggered Entrance Animations เมื่อโหลดหน้าจอ
 */
export default function ProductShelf({
  title = "สินค้าทั้งหมด",
  products,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  renderStars,
  onViewProduct,
}: ProductShelfProps) {
  return (
    <section className="glass-xl p-7 border border-[var(--color-border)]">
      
      {/* ส่วนหัวของชั้นโชว์สินค้า */}
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="font-display text-2xl text-[var(--color-text)] font-black">
            {title}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-bold">
            พบสินค้าทั้งหมด {products.length} รายการพรีเมียม
          </p>
        </div>
        
        <div className="text-xs font-bold text-[var(--color-text-secondary)] hidden sm:block uppercase tracking-wider">
          เลือกเฉดสี · เพิ่มใส่ตะกร้า · ตรวจสอบสต็อกเรียลไทม์
        </div>
      </div>

      {/* แอนิเมชันเปิดตัวการ์ดสินค้าแบบ Staggered Grid เคลื่อนตัวขึ้นนุ่มนวล */}
      {products.length === 0 ? (
        <div className="py-12 text-center text-sm font-semibold text-[var(--color-text-secondary)]">
          ไม่พบรายการสินค้าที่ท่านค้นหา ย้อนกลับเพื่อล้างตัวกรองนะคะ
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1, // ค่อย ๆ เรนเดอร์การ์ดทีละใบเว้นห่างกัน 0.1 วินาที
              },
            },
          }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
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
      )}
    </section>
  );
}
