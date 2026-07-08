/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface BottomNavProps {
  view: string;
  setView: (v: any) => void;
  cartCount: number;
}

/**
 * แถบนำทางด้านล่างแบบตอบสนอง (Responsive Mobile Bottom Navigation Bar)
 * อำนวยความสะดวกในการกดเข้าหน้าต่างต่าง ๆ บนหน้าจอมือถือได้อย่างเหมาะสม มีจุดบอกจำนวนในตะกร้าทันที
 */
export default function BottomNav({
  view,
  setView,
  cartCount,
}: BottomNavProps) {
  
  const navItems = [
    { label: "หน้าแรก", icon: "🏠", view: "home" },
    { label: "สตูดิโอ", icon: "💄", view: "studio" },
    { label: "ตะกร้า", icon: "🛒", view: "checkout", count: cartCount },
    { label: "ลิสต์โปรด", icon: "❤️", view: "wishlist" },
    { label: "บัญชี", icon: "👤", view: "account" },
  ];

  return (
    <nav className="bottom-nav lg:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = view === item.view;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setView(item.view)}
              className={`bottom-nav-item cursor-pointer flex flex-col items-center justify-center py-2 transition-all ${
                isActive ? "active text-[var(--color-primary)] font-bold scale-105" : "text-[var(--color-text-secondary)]"
              }`}
            >
              <span className="relative bottom-nav-icon text-xl flex items-center justify-center">
                {item.icon}
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-black text-white shadow-md">
                    {item.count}
                  </span>
                )}
              </span>
              <span className="bottom-nav-label text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
