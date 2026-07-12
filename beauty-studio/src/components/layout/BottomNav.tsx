"use client";

export function BottomNav({
  view,
  setView,
  cartCount,
}: {
  view: string;
  setView: (v: any) => void;
  cartCount: number;
}) {
  const navItems = [
    { label: "Home", icon: "🏠", view: "home" },
    { label: "Studio", icon: "💄", view: "studio" },
    { label: "Cart", icon: "🛒", view: "checkout", count: cartCount },
    { label: "Wishlist", icon: "❤️", view: "wishlist" },
    { label: "Profile", icon: "👤", view: "account" },
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

