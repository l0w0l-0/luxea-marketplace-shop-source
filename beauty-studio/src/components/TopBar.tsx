/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from "../types";

interface TopBarProps {
  cartCount: number;
  wishlistCount: number;
  search: string;
  setSearch: (value: string) => void;
  setView: (value: any) => void;
  user: User | null;
}

/**
 * แถบหัวข้อยอดนิยม (Header/TopBar) ของร้าน LUXEA
 * ประกอบด้วยตราสินค้า ช่องค้นหาสินค้า ปุ่มจัดการบัญชี และปุ่มตะกร้าช้อปปิ้ง
 */
export default function TopBar({
  cartCount,
  wishlistCount,
  search,
  setSearch,
  setView,
  user,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/55 backdrop-blur-xl">
      <div className="w-full px-4 md:px-6 xl:px-10 2xl:px-12">
        <div className="topbar-shell flex items-center gap-4 rounded-[28px] px-3 py-3 md:px-4">
          
          {/* ส่วนโลโก้และชื่อแบรนด์ */}
          <button className="shrink-0 text-left cursor-pointer" onClick={() => setView("home")}>
            <div className="flex items-center gap-3">
              <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 shadow-sm transition hover:scale-105">
                <span className="text-[var(--color-primary)] font-black text-xl">✦</span>
              </div>
              <div className="leading-none">
                <p className="font-display text-xl text-[var(--color-primary)] font-black tracking-wider">
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

          {/* ช่องค้นหาสินค้าพรีเมียม */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="w-full max-w-[560px]">
              <div className="search-shell flex items-center gap-2 rounded-full px-3 py-2 bg-white/80 border border-[var(--color-border)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent transition-all">
                <span className="text-[var(--color-text-secondary)] ml-1 text-lg">⌕</span>
                <input
                  className="min-w-0 flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]"
                  placeholder="ค้นหา rosy lip, blush glow, foundation..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button className="btn btn-primary h-11 px-5 hidden sm:inline-flex shrink-0">
                  ค้นหา
                </button>
              </div>
            </div>
          </div>

          {/* ปุ่มจัดการบัญชี, รายการโปรด, ตะกร้าสินค้า */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              className="btn btn-secondary h-11 px-4 hidden sm:inline-flex"
              onClick={() => setView("account")}
            >
              <span className="hidden md:inline font-bold">
                {user ? user.name : "เข้าสู่ระบบ"}
              </span>
              <span className="md:hidden">👤</span>
            </button>
            
            {/* ปุ่มเปิดหน้ารายการโปรด */}
            <button
              className="relative btn btn-secondary h-11 px-4 flex items-center justify-center min-w-[44px]"
              onClick={() => setView("wishlist")}
              title="รายการโปรด"
            >
              <span className="text-lg">♡</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white shadow-md animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* ปุ่มเปิดหน้าตะกร้าสินค้าเพื่อเช็คเอาท์ */}
            <button
              className="relative btn btn-secondary h-11 px-4 flex items-center justify-center min-w-[44px]"
              onClick={() => setView("checkout")}
              title="ตะกร้าสินค้า"
            >
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white shadow-md animate-pulse">
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
