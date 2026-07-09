/*
==================================================
ไฟล์: components/features/categories/CategoryChips.tsx

หน้าที่:
แสดงหมวดหมู่สินค้าในรูปแบบ Chips

ใช้สำหรับ:
- หน้า Home
- หน้า Shop

ทำงานร่วมกับ:
- BeautyShopApp

หมายเหตุ:
รองรับ Scroll แนวนอนบนมือถือ
==================================================
*/

"use client";

/**
 * Chips หมวดหมู่สินค้า
 *
 * จุดประสงค์: ให้ผู้ใช้เลือกหมวดหมู่สินค้า
 * Input: categories, activeCategory, setCategory
 * Output: JSX Element
 */
export function CategoryChips({
  categories,
  activeCategory,
  setCategory,
}: {
  categories: string[];
  activeCategory: string;
  setCategory: (value: string) => void;
}) {
  return (
    <section className="glass p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-[var(--color-text)]">หมวดหมู่</p>
        <p className="text-sm font-bold text-[var(--color-primary)]">
          {activeCategory}
        </p>
      </div>
      <div className="mt-3 -mx-1 flex gap-2 overflow-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
              item === activeCategory
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-white/70 text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}