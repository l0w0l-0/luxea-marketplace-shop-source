/*
==================================================
ไฟล์: components/features/home/QuickMenu.tsx

หน้าที่:
เมนูลัดสำหรับมือถือ

ใช้สำหรับ:
- หน้า Home (Mobile)

ทำงานร่วมกับ:
- User Types
- BeautyShopApp

หมายเหตุ:
แสดงเฉพาะบนมือถือ
==================================================
*/

"use client";

import { User } from "@/src/types";

/**
 * เมนูลัด
 *
 * จุดประสงค์: ให้ผู้ใช้เข้าถึงฟังก์ชันหลักได้เร็วบนมือถือ
 * Input: setView, user
 * Output: JSX Element
 */
export function QuickMenu({
  setView,
  user,
}: {
  setView: (v: any) => void;
  user: User | null;
}) {
  const quickMenus = [
    { label: "ร้านค้า", icon: "\uD83D\uDECD\uFE0F", view: "shop" },
    { label: "สตูดิโอ", icon: "\uD83D\uDC84", view: "studio" },
    { label: "รายการโปรด", icon: "\u2764\uFE0F", view: "wishlist" },
    { label: "ชำระเงิน", icon: "\uD83D\uDED2", view: "checkout" },
    { label: "บัญชี", icon: "\uD83D\uDC64", view: "account" },
    ...(user?.role === "admin"
      ? [{ label: "แอดมิน", icon: "\uD83D\uDEE0\uFE0F", view: "admin" }]
      : []),
  ];
  return (
    <section className="glass p-4">
      <div className="-mx-1 flex gap-2 overflow-auto px-1">
        {quickMenus.map((item) => (
          <button
            key={item.label}
            onClick={() => setView(item.view)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-sm font-bold text-[var(--color-text)] shadow-sm transition-all hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}