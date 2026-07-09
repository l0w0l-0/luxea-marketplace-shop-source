/*
==================================================

ไฟล์: BottomNav.tsx

ตำแหน่ง: src/components/layout/

หน้าที่:
แถบนำทางด้านล่างสำหรับมือถือ (Mobile Bottom Navigation)
แสดงเฉพาะบนหน้าจอขนาดเล็ก (lg:hidden)

รับผิดชอบ:
- แสดงเมนูนำทางหลัก 5 รายการ
- แสดง badge จำนวนสินค้าในตะกร้า
- ไฮไลท์หน้าที่กำลังดูอยู่

ใช้งานร่วมกับ:
- BeautyShopApp (Orchestrator)
- AppView Type

Export:
- BottomNav

หมายเหตุ:
- แสดงเฉพาะบนมือถือ (ซ่อนบน Desktop ด้วย lg:hidden)
- ใช้ Grid 5 คอลัมน์
- badge แสดงเฉพาะ Cart เท่านั้น

==================================================
*/

// ======================================================
// Imports
// นำเข้า Library และ Component ที่จำเป็น
// ======================================================

"use client";

import type { AppView } from "@/src/types";

/**
 * จุดประสงค์:
 * แสดงแถบนำทางด้านล่างสำหรับมือถือ
 *
 * การทำงาน:
 * สร้างปุ่มนำทาง 5 ปุ่ม (Home, Studio, Cart, Wishlist, Profile)
 * ปุ่ม Cart จะแสดง badge เมื่อมีสินค้าในตะกร้า
 * ปุ่มที่กำลัง active จะได้รับ class "active"
 *
 * Parameter:
 * view (string) - หน้าที่กำลังแสดงอยู่
 * setView (function) - ฟังก์ชันเปลี่ยนหน้า
 * cartCount (number) - จำนวนสินค้าในตะกร้า
 *
 * Return:
 * JSX Element
 *
 * หมายเหตุ:
 * ใช้ AppView type เพื่อกำหนดหน้าที่เปลี่ยนไปได้
 * badge ใช้ warning style (anger)
 */
export function BottomNav({
  view,
  setView,
  cartCount,
}: {
  view: string;
  setView: (v: AppView) => void;
  cartCount: number;
}) {
  // รายการเมนูนำทาง
  const navItems = [
    { label: "Home", icon: "\uD83C\uDFE0", view: "home" as const },
    { label: "Studio", icon: "\uD83D\uDC84", view: "studio" as const },
    { label: "Cart", icon: "\uD83D\uDED2", view: "checkout" as const, count: cartCount },
    { label: "Wishlist", icon: "\u2764\uFE0F", view: "wishlist" as const },
    { label: "Profile", icon: "\uD83D\uDC64", view: "account" as const },
  ];

  return (
    <nav className="bottom-nav lg:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setView(item.view)}
            className={`bottom-nav-item ${view === item.view ? "active" : ""}`}
          >
            <span className="relative bottom-nav-icon">
              {item.icon}
              {/* แสดง badge เฉพาะ Cart เมื่อมีสินค้า */}
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-bold text-white">
                  {item.count}
                </span>
              )}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}