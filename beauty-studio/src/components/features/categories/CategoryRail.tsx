/*
==================================================
ไฟล์: components/features/categories/CategoryRail.tsx

หน้าที่:
แถบหมวดหมู่สินค้าด้านข้าง (Desktop)

ใช้สำหรับ:
- หน้า Shop

ทำงานร่วมกับ:
- CATEGORY_ICONS Constants

หมายเหตุ:
แสดงเฉพาะบน Desktop (lg:block)
==================================================
*/

"use client";

import { CATEGORY_ICONS } from "@/src/constants";

/**
 * แถบหมวดหมู่ด้านข้าง
 *
 * จุดประสงค์: แสดงหมวดหมู่สินค้าในรูปแบบ Sidebar
 * Input: categories, activeCategory, setCategory
 * Output: JSX Element
 */
export function CategoryRail({
  categories,
  activeCategory,
  setCategory,
}: {
  categories: string[];
  activeCategory: string;
  setCategory: (value: string) => void;
}) {
  return (
    <aside className="glass-xl p-6 hidden lg:block sticky top-24 self-start">
      <h2 className="mb-4 text-sm font-bold text-[var(--color-text)]">
        หมวดหมู่
      </h2>
      <div className="space-y-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`w-full flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-left text-sm font-medium transition-all ${
              item === activeCategory
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text)] hover:bg-[var(--color-primary-50)]"
            }`}
          >
            <span className="text-lg">{CATEGORY_ICONS[item] || "\uD83D\uDECD\uFE0F"}</span>
            {item}
          </button>
        ))}
      </div>
    </aside>
  );
}