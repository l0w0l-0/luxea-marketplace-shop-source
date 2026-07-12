"use client";

import type { User } from "@/src/types";

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
          <button className="shrink-0" onClick={() => setView("home")}>
            <div className="flex items-center gap-3">
              <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)]">
                <span className="text-[var(--color-primary)] font-black">✦</span>
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

          <div className="flex-1 flex justify-center min-w-0">
            <div className="w-full max-w-[560px]">
              <div className="search-shell flex items-center gap-2 rounded-full px-3 py-2">
                <span className="text-[var(--color-text-secondary)]">⌕</span>
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

          <div className="shrink-0 flex items-center gap-2">
            <button
              className="btn btn-secondary h-11 px-4 hidden sm:inline-flex"
              onClick={() => setView("account")}
            >
              <span className="hidden md:inline">{user ? user.name : "เข้าสู่ระบบ"}</span>
              <span className="md:hidden">👤</span>
            </button>
            <button
              className="relative btn btn-secondary h-11 px-4"
              onClick={() => setView("wishlist")}
            >
              <span className="md:hidden">♡</span>
              <span className="hidden md:inline">♡</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              className="relative btn btn-secondary h-11 px-4"
              onClick={() => setView("checkout")}
            >
              <span className="md:hidden">🛒</span>
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

