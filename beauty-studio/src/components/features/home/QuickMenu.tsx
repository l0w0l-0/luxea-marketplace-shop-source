"use client";

import type { User } from "@/src/types";

export function QuickMenu({
  setView,
  user,
}: {
  setView: (v: any) => void;
  user: User | null;
}) {
  const quickMenus = [
    { label: "ร้านค้า", icon: "🛍️", view: "shop" },
    { label: "สตูดิโอ", icon: "💄", view: "studio" },
    { label: "รายการโปรด", icon: "❤️", view: "wishlist" },
    { label: "ชำระเงิน", icon: "🛒", view: "checkout" },
    { label: "บัญชี", icon: "👤", view: "account" },
    ...(user?.role === "admin"
      ? [{ label: "แอดมิน", icon: "🛠️", view: "admin" }]
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

