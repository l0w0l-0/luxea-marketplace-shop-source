/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface CategoryChipsProps {
  categories: string[];
  activeCategory: string;
  setCategory: (value: string) => void;
}

/**
 * ปุ่มควบคุมหมวดหมู่แบบชิปแนวนอน (Horizontal Category Scroll Chips)
 * แสดงผลได้ดีทั้งมือถือและอุปกรณ์แท็บเล็ต ช่วยในการคัดกรองหมวดหมู่สินค้าอย่างรวดเร็ว
 */
export default function CategoryChips({
  categories,
  activeCategory,
  setCategory,
}: CategoryChipsProps) {
  return (
    <section className="glass p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-[var(--color-text)]">ค้นหาตามหมวดหมู่</p>
        <p className="text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary-50)] px-3 py-1 rounded-full">
          {activeCategory}
        </p>
      </div>
      
      {/* สไลด์แนวนอนบนมือถือ และเรียงลำดับปกติบนหน้าจอใหญ่ */}
      <div className="mt-3 -mx-1 flex gap-2 overflow-auto px-1 pb-1 scrollbar-none md:flex-wrap md:overflow-visible">
        {categories.map((item) => {
          const isSelected = item === activeCategory;
          return (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[var(--color-primary)] text-white shadow-md scale-105"
                  : "bg-white/70 text-[var(--color-text)] border border-[var(--color-border)] hover:bg-white hover:border-[var(--color-primary-200)]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
}
