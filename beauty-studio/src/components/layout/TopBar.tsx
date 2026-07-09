/*
==================================================

ไฟล์: TopBar.tsx

ตำแหน่ง: src/components/layout/

หน้าที่:
แถบนำทางด้านบนของแอปพลิเคชัน (Sticky Header)
เป็นส่วนแรกที่ผู้ใช้เห็นเมื่อเข้าเว็บไซต์

รับผิดชอบ:
- แสดงโลโก้ LUXEA และชื่อร้าน
- ช่องค้นหาสินค้า
- ปุ่มเข้าสู่ระบบ / แสดงชื่อผู้ใช้
- ปุ่ม Wishlist พร้อมจำนวน
- ปุ่มตะกร้าสินค้าพร้อมจำนวน

ใช้งานร่วมกับ:
- BeautyShopApp (Orchestrator)
- User Type

Export:
- TopBar

หมายเหตุ:
- เป็น Sticky Header (ติดอยู่ด้านบนเมื่อเลื่อน)
- รองรับ Responsive Design
- แสดงจำนวนสินค้าใน Wishlist และตะกร้า

==================================================
*/

// ======================================================
// Imports
// นำเข้า Library และ Component ที่จำเป็น
// ======================================================

"use client";

import { User } from "@/src/types";

/**
 * จุดประสงค์:
 * แสดงแถบนำทางด้านบนของแอปพลิเคชัน
 *
 * การทำงาน:
 * 1. แสดงโลโก้ LUXEA เมื่อคลิกไปหน้า Home
 * 2. ช่องค้นหาสินค้าแบบ Real-time
 * 3. ปุ่มบัญชีผู้ใช้ (แสดงชื่อถ้าล็อกอินแล้ว)
 * 4. ปุ่ม Wishlist พร้อม badge จำนวน
 * 5. ปุ่มตะกร้าพร้อม badge จำนวน
 *
 * Parameter:
 * cartCount (number) - จำนวนสินค้าในตะกร้า
 * wishlistCount (number) - จำนวนสินค้าใน Wishlist
 * search (string) - ข้อความค้นหาปัจจุบัน
 * setSearch (function) - เปลี่ยนข้อความค้นหา
 * setView (function) - เปลี่ยนหน้า
 * user (User | null) - ข้อมูลผู้ใช้ (null ถ้ายังไม่ล็อกอิน)
 *
 * Return:
 * JSX Element
 *
 * หมายเหตุ:
 * ใช้ backdrop-blur เพื่อความสวยงาม
 * Badge แสดงเมื่อมีจำนวนมากกว่า 0
 */
export function TopBar({
  cartCount,
  wishlistCount,
  search,
  setSearch,
  setView,
  user,
}: {
  cartCount: number;
  wishlistCount: number;
  search: string;
  setSearch: (value: string) => void;
  setView: (value: any) => void;
  user: User | null;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/55 backdrop-blur-xl">
      <div className="w-full px-4 md:px-6 xl:px-10 2xl:px-12">
        <div className="topbar-shell flex items-center gap-4 rounded-[28px] px-3 py-3 md:px-4">
          {/* โลโก้ LUXEA - คลิกเพื่อกลับหน้า Home */}
          <button className="shrink-0" onClick={() => setView("home")}>
            <div className="flex items-center gap-3">
              <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)]">
                <span className="text-[var(--color-primary)] font-black">{"\u2726"}</span>
              </div>
              <div className="leading-none">
                <p className="font-display text-xl text-[var(--color-primary)]">
                  LUXEA
                </p>
                <p className="mt-1 text-[10px] font-bold tracking-[0.24em] text-[var(--color-text-secondary)]">
                  BEAUTY STUDIO
                </p>
                <p className="mt-1 hidden text-[11px] font-semibold text-[var(--color-text-secondary)] md:block">
                  rosy soft-glam picks
                </p>
              </div>
            </div>
          </button>

          {/* ช่องค้นหาสินค้า */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="w-full max-w-[560px]">
              <div className="search-shell flex items-center gap-2 rounded-full px-3 py-2">
                <span className="text-[var(--color-text-secondary)]">{"\u2315"}</span>
                <input
                  className="min-w-0 flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]"
                  placeholder="ค้นหา rosy lip, blush glow, foundation..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button className="btn btn-primary h-11 px-5 hidden sm:inline-flex">
                  ค้นหา
                </button>
              </div>
            </div>
          </div>

          {/* ปุ่มบัญชี, Wishlist, ตะกร้า */}
          <div className="shrink-0 flex items-center gap-2">
            {/* ปุ่มเข้าสู่ระบบ / บัญชีผู้ใช้ */}
            <button
              className="btn btn-secondary h-11 px-4 hidden sm:inline-flex"
              onClick={() => setView("account")}
            >
              <span className="hidden md:inline">{user ? user.name : "เข้าสู่ระบบ"}</span>
              <span className="md:hidden">{"\uD83D\uDC64"}</span>
            </button>
            {/* ปุ่ม Wishlist พร้อม badge */}
            <button
              className="relative btn btn-secondary h-11 px-4"
              onClick={() => setView("wishlist")}
            >
              <span className="md:hidden">{"\u2661"}</span>
              <span className="hidden md:inline">{"\u2661"}</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>
            {/* ปุ่มตะกร้าสินค้าพร้อม badge */}
            <button
              className="relative btn btn-secondary h-11 px-4"
              onClick={() => setView("checkout")}
            >
              <span className="md:hidden">{"\uD83D\uDED2"}</span>
              <span className="hidden md:inline">ตะกร้า</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}