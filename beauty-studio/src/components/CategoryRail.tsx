/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface CategoryRailProps {
  categories: string[];
  activeCategory: string;
  setCategory: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  undertone: string;
  setUndertone: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
}

/**
 * แถบหมวดหมู่และตัวกรองสินค้าด้านข้างสำหรับหน้าจอขนาดใหญ่ (Desktop Sidebar Category & Filter Rail)
 * จัดวางทางซ้ายมือ ประกอบด้วย หมวดหมู่สินค้า ตัวเลือกการจัดเรียง การกรองด้วยโทนผิว และการกรองช่วงราคา
 */
export default function CategoryRail({
  categories,
  activeCategory,
  setCategory,
  sort,
  setSort,
  undertone,
  setUndertone,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: CategoryRailProps) {
  
  // ไอคอนหมวดหมู่เฉพาะของสินค้า
  const categoryIcons: Record<string, string> = {
    ทั้งหมด: "🛍️",
    Lipstick: "💄",
    Blush: "🌸",
    Highlighter: "✨",
    Foundation: "🧴",
    Skincare: "🧖‍♀️",
    Eyeshadow: "🎨",
    Eye: "👁️",
    Setting: "💫",
    Face: "🧴",
    Tools: "🖌️",
  };

  const undertones = ["ทั้งหมด", "Cool", "Warm", "Neutral"];

  return (
    <aside className="glass-xl p-6 hidden lg:block sticky top-24 self-start min-w-[260px] space-y-6 max-h-[85vh] overflow-y-auto">
      {/* 1. หมวดหมู่สินค้า */}
      <div>
        <h2 className="mb-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.15em] border-b border-[var(--color-border)] pb-2">
          หมวดหมู่สินค้า
        </h2>
        <div className="space-y-1">
          {categories.map((item) => {
            const isSelected = item === activeCategory;
            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`w-full flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white shadow-md translate-x-1"
                    : "text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
                }`}
              >
                <span className="text-base shrink-0">{categoryIcons[item] || "🛍️"}</span>
                <span className="truncate">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ตัวเลือกการจัดเรียงสินค้า */}
      <div>
        <h2 className="mb-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.15em] border-b border-[var(--color-border)] pb-2">
          จัดเรียงตาม
        </h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full bg-white/80 border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all cursor-pointer"
        >
          <option value="popular">ยอดนิยม (รีวิวเยอะ)</option>
          <option value="rating">คะแนนรีวิวสูงสุด</option>
          <option value="price-asc">ราคา: ต่ำ - สูง</option>
          <option value="price-desc">ราคา: สูง - ต่ำ</option>
        </select>
      </div>

      {/* 3. การกรองด้วยโทนผิว (Skin Undertone) */}
      <div>
        <h2 className="mb-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.15em] border-b border-[var(--color-border)] pb-2">
          โทนสีผิว (Undertone)
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {undertones.map((ut) => {
            const isSelected = ut === undertone;
            return (
              <button
                key={ut}
                onClick={() => setUndertone(ut)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "bg-white/80 text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                {ut === "ทั้งหมด" ? "ทั้งหมด" : ut === "Cool" ? "❄️ Cool" : ut === "Warm" ? "☀️ Warm" : "🌸 Neutral"}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. การกรองช่วงราคา */}
      <div>
        <h2 className="mb-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.15em] border-b border-[var(--color-border)] pb-2">
          ช่วงราคา (บาท)
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="ต่ำสุด"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-white/80 border border-[var(--color-border)] rounded-[var(--radius-md)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none text-center focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <span className="text-[var(--color-text-secondary)] text-sm">-</span>
          <input
            type="number"
            placeholder="สูงสุด"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-white/80 border border-[var(--color-border)] rounded-[var(--radius-md)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none text-center focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
        {(minPrice || maxPrice) && (
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
            }}
            className="mt-3 w-full text-xs text-[var(--color-primary)] font-bold text-center underline hover:text-[var(--color-primary-dark)] cursor-pointer"
          >
            ล้างช่วงราคา
          </button>
        )}
      </div>
    </aside>
  );
}
