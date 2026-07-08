/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from "../types";

interface QuickMenuProps {
  setView: (v: any) => void;
  user: User | null;
}

/**
 * แถบลิสต์เมนูลอยแบบด่วน (Quick Navigation Horizontal Menu)
 * ปรากฏบนหน้าจอมือถือ/แท็บเล็ต ช่วยเพิ่มความสะดวกในการคลิกเข้าหน้าต่าง ๆ โดยสไลด์ปัดทางแนวนอนได้
 */
export default function QuickMenu({ setView, user }: QuickMenuProps) {
  
  const quickMenus = [
    { label: "ร้านค้าพรีเมียม", icon: "🛍️", view: "shop" },
    { label: "ลองสีสตูดิโอ", icon: "💄", view: "studio" },
    { label: "รายการที่รัก", icon: "❤️", view: "wishlist" },
    { label: "ชำระเงินด่วน", icon: "🛒", view: "checkout" },
    { label: "ประวัติบัญชี", icon: "👤", view: "account" },
    ...(user?.role === "admin"
      ? [{ label: "ระบบหลังร้าน", icon: "🛠️", view: "admin" }]
      : []),
  ];

  return (
    <section className="glass p-4 bg-white/45 border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm">
      <div className="-mx-1 flex gap-2 overflow-auto px-1 scrollbar-none">
        {quickMenus.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setView(item.view)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-xs font-bold text-[var(--color-text)] shadow-sm transition-all duration-200 cursor-pointer hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)] hover:scale-105"
          >
            <span className="text-sm shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
