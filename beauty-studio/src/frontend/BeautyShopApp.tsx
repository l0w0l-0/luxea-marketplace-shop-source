"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  shade: string;
  price: number;
  stock: number;
  rating: number;
  color: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  tier: "Member" | "VIP";
  points: number;
};

type CartItem = {
  productId: string;
  quantity: number;
};

type Order = {
  id: string;
  customerName: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  status: "paid" | "waiting_payment" | "cod";
  createdAt: string;
};

const paymentMethods = ["Credit Card", "Bank Transfer", "Cash On Delivery"];

const categoryIcons: Record<string, string> = {
  ทั้งหมด: "🛍️",
  Lipstick: "💄",
  Blush: "🌸",
  Highlighter: "✨",
  Foundation: "🧴",
  Skincare: "🧖‍♀️",
  Serum: "💧",
  Sunscreen: "☀️",
};

const quickMenus = [
  { label: "Flash Sale", icon: "⚡" },
  { label: "คูปอง", icon: "🎟️" },
  { label: "สินค้าใหม่", icon: "🆕" },
  { label: "ขายดี", icon: "🔥" },
  { label: "ส่งฟรี", icon: "🚚" },
  { label: "VIP Beauty", icon: "👑" },
  { label: "รีวิวสูง", icon: "⭐" },
  { label: "ลดล้างสต็อก", icon: "🏷️" },
];

export default function BeautyShopApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"home" | "checkout" | "account" | "admin">("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [message, setMessage] = useState("ระบบพร้อมขายสินค้า");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [loginForm, setLoginForm] = useState({
    email: "admin@luxea.test",
    password: "admin123",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (user) {
      loadOrders(user.id);
    }
  }, [user]);

  const categories = useMemo(() => {
    return ["ทั้งหมด", ...Array.from(new Set(products.map((item) => item.category)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchedCategory = category === "ทั้งหมด" || product.category === category;
      const keyword = `${product.name} ${product.category} ${product.shade}`.toLowerCase();
      return matchedCategory && keyword.includes(search.toLowerCase().trim());
    });
  }, [category, products, search]);

  const flashSaleProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  const cartSummary = useMemo(() => {
    return cart.reduce(
      (summary, item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) return summary;
        return {
          quantity: summary.quantity + item.quantity,
          total: summary.total + product.price * item.quantity,
        };
      },
      { quantity: 0, total: 0 },
    );
  }, [cart, products]);

  async function loadProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(data.products);
  }

  async function loadOrders(userId: string) {
    const response = await fetch(`/api/orders?userId=${userId}`);
    const data = await response.json();
    setOrders(data.orders);
  }

  function addToCart(product: Product) {
    if (product.stock < 1) {
      setMessage("สินค้าหมดสต็อกแล้ว");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }
      return [...currentCart, { productId: product.id, quantity: 1 }];
    });
    setMessage(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setUser(data.user);
    setView("home");
    setMessage(`ยินดีต้อนรับ ${data.user.name}`);
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerForm),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setUser(data.user);
    setRegisterForm({ name: "", email: "", password: "" });
    setView("home");
    setMessage("สมัครสมาชิกสำเร็จ");
  }

  async function checkout() {
    if (!user) {
      setMessage("กรุณาล็อกอินก่อนชำระเงิน");
      setView("account");
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, items: cart, paymentMethod }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setCart([]);
    setProducts(data.products);
    await loadOrders(user.id);
    setMessage(`ชำระเงินสำเร็จ ออเดอร์ ${data.order.id}`);
  }

  async function updateStock(product: Product, nextStock: number) {
    const response = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, stock: nextStock }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((entry) => (entry.id === product.id ? data.product : entry)),
    );
    setMessage(`อัปเดตสต็อก ${product.name} แล้ว`);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#222222]">
      <TopBar
        cartCount={cartSummary.quantity}
        search={search}
        setSearch={setSearch}
        setView={setView}
        user={user}
      />

      <div className="mx-auto max-w-[1200px] px-3 py-4 md:px-4">
        <StatusStrip message={message} />

        {view === "home" && (
          <div className="grid gap-3 lg:grid-cols-[220px_1fr_280px]">
            <CategoryRail
              categories={categories}
              activeCategory={category}
              setCategory={setCategory}
            />

            <section className="space-y-3">
              <HeroMall />
              <QuickMenu />
              <FlashSale products={flashSaleProducts} onAdd={addToCart} />
              <ProductShelf products={filteredProducts} onAdd={addToCart} />
            </section>

            <RightRail
              cart={cart}
              products={products}
              total={cartSummary.total}
              user={user}
              orders={orders}
              setView={setView}
            />
          </div>
        )}

        {view === "checkout" && (
          <CheckoutPanel
            cart={cart}
            products={products}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onCheckout={checkout}
            onRemove={(productId) =>
              setCart((currentCart) =>
                currentCart.filter((item) => item.productId !== productId),
              )
            }
          />
        )}

        {view === "account" && (
          <AccountPanel
            user={user}
            loginForm={loginForm}
            registerForm={registerForm}
            setLoginForm={setLoginForm}
            setRegisterForm={setRegisterForm}
            onLogin={login}
            onRegister={register}
            onLogout={() => {
              setUser(null);
              setOrders([]);
              setMessage("ออกจากระบบแล้ว");
            }}
          />
        )}

        {view === "admin" && (
          <AdminPanel
            products={products}
            orders={orders}
            total={cartSummary.total}
            onUpdateStock={updateStock}
          />
        )}
      </div>

      <footer className="mt-10 border-t border-[#eeeeee] bg-white py-8 text-center text-xs text-[#9e9e9e]">
        <p>LUXEA Beauty Mall — จัดหน้าในสไตล์ Shopee เพื่อการเรียนรู้วิชา CSI204</p>
      </footer>
    </main>
  );
}

function TopBar({
  cartCount,
  search,
  setSearch,
  setView,
  user,
}: {
  cartCount: number;
  search: string;
  setSearch: (value: string) => void;
  setView: (value: "home" | "checkout" | "account" | "admin") => void;
  user: User | null;
}) {
  return (
    <header className="sticky top-0 z-30 shadow-sm">
      {/* แถบบนสุด แบบ Shopee */}
      <div className="bg-[#f53d2d] text-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-3 py-1.5 text-[11px] md:px-4">
          <div className="flex gap-4">
            <button className="opacity-90 hover:opacity-100">Seller Centre</button>
            <button className="opacity-90 hover:opacity-100">ดาวน์โหลด</button>
            <span className="hidden opacity-90 sm:inline">ติดตามเราได้ที่</span>
            <span className="hidden gap-2 sm:flex">📘 📸 🎵</span>
          </div>
          <div className="flex gap-4">
            <button className="opacity-90 hover:opacity-100">แจ้งเตือน</button>
            <button className="opacity-90 hover:opacity-100">ช่วยเหลือ</button>
            <button className="font-bold" onClick={() => setView("account")}>
              {user ? user.name : "สมัคร / เข้าสู่ระบบ"}
            </button>
          </div>
        </div>
      </div>

      {/* Header หลัก */}
      <div className="bg-[#ee4d2d]">
        <div className="mx-auto max-w-[1200px] px-3 py-3 md:px-4">
          <div className="grid items-center gap-4 md:grid-cols-[150px_1fr_auto]">
            <button className="text-left" onClick={() => setView("home")}>
              <p className="font-display text-3xl leading-none text-white">LUXEA</p>
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/85">BEAUTY MALL</p>
            </button>

            <div className="rounded-sm bg-white p-[3px] shadow">
              <div className="grid grid-cols-[1fr_90px] items-center">
                <input
                  className="h-9 px-3 text-sm text-[#222] outline-none"
                  placeholder="ค้นหา lipstick, blush, foundation..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button className="h-9 rounded-sm bg-[#ee4d2d] text-sm font-bold text-white hover:bg-[#d73211]">
                  ค้นหา
                </button>
              </div>
            </div>

            <button
              className="relative hidden h-11 items-center gap-2 rounded-sm border border-white/50 px-4 text-sm font-bold text-white md:flex"
              onClick={() => setView("checkout")}
            >
              🛒 ตะกร้า
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#ffce3d] text-[11px] font-black text-[#222]">
                {cartCount}
              </span>
            </button>
          </div>

          {/* Popular keyword */}
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-white/85">
            <span>ค้นหายอดนิยม:</span>
            <button className="hover:underline">lip tint</button>
            <button className="hover:underline">คุชชั่น</button>
            <button className="hover:underline">กันแดด</button>
            <button className="hover:underline">ลิปแมท</button>
            <button className="hover:underline">บรัชออน</button>
            <button className="hover:underline">เซรั่ม</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusStrip({ message }: { message: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-sm bg-white px-4 py-2.5 text-xs shadow-sm">
      <p className="font-bold text-[#ee4d2d]">✅ LUXEA Guarantee — คืนเงินหากไม่ตรงปก</p>
      <p className="text-[#757575]">{message}</p>
      <p className="font-bold text-[#ee4d2d]">🚚 ส่งฟรีเมื่อครบ ฿699</p>
    </div>
  );
}

function CategoryRail({
  categories,
  activeCategory,
  setCategory,
}: {
  categories: string[];
  activeCategory: string;
  setCategory: (value: string) => void;
}) {
  return (
    <aside className="rounded-sm bg-white shadow-sm lg:sticky lg:top-32 lg:self-start">
      <div className="border-b border-[#eeeeee] p-3">
        <h2 className="text-sm font-bold">หมวดหมู่สินค้า</h2>
      </div>
      <div className="grid grid-cols-2 gap-1 p-2 lg:grid-cols-1">
        {categories.map((item) => (
          <button
            className={`flex items-center gap-2 rounded-sm px-3 py-2.5 text-left text-[13px] font-medium transition ${
              item === activeCategory
                ? "bg-[#fff0ec] font-bold text-[#ee4d2d]"
                : "text-[#333] hover:bg-[#fafafa] hover:text-[#ee4d2d]"
            }`}
            key={item}
            onClick={() => setCategory(item)}
          >
            <span>{categoryIcons[item] ?? "🛒"}</span>
            {item}
          </button>
        ))}
      </div>
      <div className="border-t border-[#eeeeee] p-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#757575]">
          ตัวกรอง
        </p>
        <div className="mt-2 space-y-2 text-[13px] text-[#555]">
          <label className="flex gap-2"><input type="checkbox" /> มีสินค้า</label>
          <label className="flex gap-2"><input type="checkbox" /> คะแนน 4.5+</label>
          <label className="flex gap-2"><input type="checkbox" /> โปรโมชัน</label>
        </div>
      </div>
    </aside>
  );
}

function HeroMall() {
  return (
    <section className="grid gap-3 md:grid-cols-[1fr_260px]">
      <div className="relative min-h-56 overflow-hidden rounded-sm bg-gradient-to-r from-[#f53d2d] via-[#ee4d2d] to-[#ff7337] p-6 text-white shadow-sm md:min-h-64">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffe2d9]">
          LUXEA Midyear Beauty Sale
        </p>
        <h2 className="mt-3 max-w-lg text-3xl font-black leading-tight md:text-5xl">
          ลดสูงสุด 45% ทุกหมวดความงาม
        </h2>
        <p className="mt-3 max-w-md text-white/85 text-sm">
          รวม lipstick, blush, skincare และ tools จัดเป็นระบบร้านค้าออนไลน์ครบวงจร
        </p>
        <button className="mt-5 rounded-sm bg-white px-6 py-2.5 text-sm font-bold text-[#ee4d2d] hover:bg-[#fff0ec]">
          ช้อปเลย
        </button>
        <div className="absolute -bottom-8 -right-8 hidden h-40 w-40 rounded-full border-[24px] border-white/25 md:block" />
      </div>
      <div className="grid gap-3">
        <PromoCard title="VIP Beauty" text="ของแถมเฉพาะสมาชิก" tone="dark" />
        <PromoCard title="New Arrivals" text="สินค้าใหม่ประจำสัปดาห์" tone="yellow" />
      </div>
    </section>
  );
}

function PromoCard({ title, text, tone }: { title: string; text: string; tone: "dark" | "yellow" }) {
  const bg =
    tone === "dark"
      ? "bg-gradient-to-br from-[#222222] to-[#4a4a4a]"
      : "bg-gradient-to-br from-[#ffce3d] to-[#ff9d3d]";
  const textColor = tone === "dark" ? "text-white" : "text-[#5a3200]";
  return (
    <div className={`rounded-sm p-4 shadow-sm ${bg} ${textColor}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">{title}</p>
      <p className="mt-1 text-xl font-black">{text}</p>
      <div className="mt-3 h-1.5 rounded-full bg-white/40" />
    </div>
  );
}

function QuickMenu() {
  return (
    <section className="grid grid-cols-4 gap-2 rounded-sm bg-white p-3 shadow-sm md:grid-cols-8">
      {quickMenus.map((item) => (
        <button className="grid gap-1.5 rounded-sm p-2 text-center text-[11px] font-bold text-[#555] hover:bg-[#fff0ec] hover:text-[#ee4d2d]" key={item.label}>
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#fff0ec] text-xl">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </section>
  );
}

function FlashSale({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  return (
    <section className="rounded-sm bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-1 text-xl font-black text-[#ee4d2d]">
            ⚡ FLASH SALE
          </h2>
          <div className="flex items-center gap-1">
            <span className="clock-chip">02</span>
            <span className="font-black text-[#ee4d2d]">:</span>
            <span className="clock-chip">14</span>
            <span className="font-black text-[#ee4d2d]">:</span>
            <span className="clock-chip">39</span>
          </div>
        </div>
        <button className="text-xs font-bold text-[#ee4d2d]">ดูทั้งหมด &gt;</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {products.map((product, index) => {
          const salePrice = Math.max(product.price - 40 - index * 5, 99);
          const discountPercent = Math.round(((product.price - salePrice) / product.price) * 100);
          return (
            <button
              className="rounded-sm border border-[#eeeeee] text-left transition hover:-translate-y-0.5 hover:border-[#ee4d2d] hover:shadow-md"
              key={product.id}
              onClick={() => onAdd(product)}
            >
              <ProductVisual product={product} compact discountPercent={discountPercent} />
              <div className="p-2">
                <p className="line-clamp-2 min-h-9 text-xs font-medium">{product.name}</p>
                <p className="font-black text-[#ee4d2d]">฿{salePrice}</p>
                <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#ffe2d9]">
                  <div
                    className="flex h-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7337] to-[#ee4d2d] text-[9px] font-bold text-white"
                    style={{ width: `${72 - index * 8}%` }}
                  >
                    ขายแล้ว {72 - index * 8}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProductShelf({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  return (
    <section className="rounded-sm bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b-2 border-[#ee4d2d] pb-3">
        <h2 className="font-black uppercase tracking-wide text-[#ee4d2d]">สินค้าแนะนำประจำวัน</h2>
        <p className="text-xs text-[#757575]">{products.length} รายการ</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={() => onAdd(product)} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const sold = Math.max(12, 80 - product.stock);

  return (
    <article className="group overflow-hidden rounded-sm border border-[#eeeeee] bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <ProductVisual product={product} discountPercent={discountPercent} />
      <div className="p-2.5">
        <p className="line-clamp-2 min-h-9 text-[13px] leading-snug">{product.name}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <p className="text-base font-black text-[#ee4d2d]">฿{product.price}</p>
          <p className="text-xs text-[#9e9e9e] line-through">฿{originalPrice}</p>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#9e9e9e]">
          <span>⭐ {product.rating} · ขายแล้ว {sold}</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#9e9e9e]">
          <span className="rounded-sm border border-[#eeeeee] px-1 text-[#00bfa5]">ส่งฟรี</span>
          <span>{product.shade}</span>
        </div>
        <button
          className="mt-2.5 h-9 w-full rounded-sm bg-[#ee4d2d] text-xs font-bold text-white hover:bg-[#d73211] disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e]"
          disabled={product.stock === 0}
          onClick={onAdd}
        >
          {product.stock === 0 ? "สินค้าหมด" : "หยิบใส่ตะกร้า"}
        </button>
      </div>
    </article>
  );
}

function ProductVisual({
  product,
  compact = false,
  discountPercent = 0,
}: {
  product: Product;
  compact?: boolean;
  discountPercent?: number;
}) {
  return (
    <div className={`relative grid place-items-center bg-[#fafafa] ${compact ? "h-24" : "h-36"}`}>
      {discountPercent > 0 && (
        <span className="discount-badge">-{discountPercent}%</span>
      )}
      <div
        className={`${compact ? "h-14 w-14" : "h-20 w-20"} rounded-[30%] border-[8px] border-white shadow-md`}
        style={{ backgroundColor: product.color }}
      />
      <span className="absolute bottom-1 left-1 rounded-sm bg-[#222222]/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
        {product.category}
      </span>
    </div>
  );
}

function RightRail({
  cart,
  products,
  total,
  user,
  orders,
  setView,
}: {
  cart: CartItem[];
  products: Product[];
  total: number;
  user: User | null;
  orders: Order[];
  setView: (value: "home" | "checkout" | "account" | "admin") => void;
}) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
      <Panel title="บัญชีของฉัน">
        {user ? (
          <div>
            <p className="text-base font-bold">{user.name}</p>
            <p className="text-xs text-[#757575]">{user.tier} · {user.points} points</p>
          </div>
        ) : (
          <button
            className="h-10 w-full rounded-sm bg-[#ee4d2d] text-sm font-bold text-white hover:bg-[#d73211]"
            onClick={() => setView("account")}
          >
            Login / Register
          </button>
        )}
      </Panel>

      <Panel title="ตะกร้าสินค้า">
        <div className="space-y-2">
          {cart.length === 0 ? (
            <p className="text-sm text-[#757575]">ยังไม่มีสินค้าในตะกร้า</p>
          ) : (
            cart.slice(0, 4).map((item) => {
              const product = products.find((entry) => entry.id === item.productId);
              if (!product) return null;
              return (
                <div className="flex justify-between gap-3 text-sm" key={item.productId}>
                  <span className="line-clamp-1">{product.name}</span>
                  <strong>x{item.quantity}</strong>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-3 border-t border-[#eeeeee] pt-3">
          <div className="flex justify-between text-sm font-black">
            <span>รวม</span>
            <span className="text-[#ee4d2d]">฿{total}</span>
          </div>
          <button
            className="mt-3 h-10 w-full rounded-sm bg-[#222222] text-sm font-bold text-white hover:bg-[#000]"
            onClick={() => setView("checkout")}
          >
            ไปหน้าชำระเงิน
          </button>
        </div>
      </Panel>

      <Panel title="เมนูระบบ">
        <div className="grid gap-2">
          <button className="rail-button" onClick={() => setView("account")}>สมาชิก / Login</button>
          <button className="rail-button" onClick={() => setView("admin")}>Admin Stock</button>
          <button className="rail-button" onClick={() => setView("checkout")}>Payment</button>
        </div>
      </Panel>

      <Panel title="ออเดอร์ล่าสุด">
        {orders.length === 0 ? (
          <p className="text-sm text-[#757575]">ยังไม่มีออเดอร์</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 3).map((order) => (
              <div className="rounded-sm bg-[#fafafa] p-2 text-sm" key={order.id}>
                <p className="font-bold">{order.id}</p>
                <p className="text-[#757575]">฿{order.total} · {order.status}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </aside>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm bg-white p-4 shadow-sm">
      <h2 className="mb-3 border-b border-[#eeeeee] pb-2 text-sm font-bold text-[#222]">{title}</h2>
      {children}
    </section>
  );
}

function CheckoutPanel({
  cart,
  products,
  paymentMethod,
  setPaymentMethod,
  onCheckout,
  onRemove,
}: {
  cart: CartItem[];
  products: Product[];
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onCheckout: () => void;
  onRemove: (productId: string) => void;
}) {
  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="rounded-sm bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">🛒 ตะกร้าและ Checkout</h2>
        <div className="mt-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-[#757575]">ตะกร้ายังว่าง</p>
          ) : (
            cart.map((item) => {
              const product = products.find((entry) => entry.id === item.productId);
              if (!product) return null;
              return (
                <div className="grid gap-3 rounded-sm border border-[#eeeeee] p-3 md:grid-cols-[80px_1fr_auto_auto] md:items-center" key={item.productId}>
                  <ProductVisual product={product} compact />
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-sm text-[#757575]">{product.shade}</p>
                  </div>
                  <p className="font-black text-[#ee4d2d]">฿{product.price} x {item.quantity}</p>
                  <button className="rounded-sm bg-[#fff0ec] px-3 py-2 text-sm font-bold text-[#ee4d2d]" onClick={() => onRemove(item.productId)}>
                    ลบ
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <aside className="rounded-sm bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black">สรุปคำสั่งซื้อ</h3>
        <label className="mt-4 block">
          <span className="text-sm font-bold text-[#ee4d2d]">วิธีชำระเงิน</span>
          <select
            className="mt-2 h-11 w-full rounded-sm border border-[#eeeeee] px-3"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            {paymentMethods.map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
        </label>
        <div className="mt-5 flex justify-between border-t border-[#eeeeee] pt-4 text-lg font-black">
          <span>Total</span>
          <span className="text-[#ee4d2d]">฿{total}</span>
        </div>
        <button
          className="mt-5 h-11 w-full rounded-sm bg-[#ee4d2d] font-bold text-white hover:bg-[#d73211] disabled:opacity-45"
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          ยืนยันชำระเงิน
        </button>
      </aside>
    </section>
  );
}

function AccountPanel({
  user,
  loginForm,
  registerForm,
  setLoginForm,
  setRegisterForm,
  onLogin,
  onRegister,
  onLogout,
}: {
  user: User | null;
  loginForm: { email: string; password: string };
  registerForm: { name: string; email: string; password: string };
  setLoginForm: (value: { email: string; password: string }) => void;
  setRegisterForm: (value: { name: string; email: string; password: string }) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
}) {
  if (user) {
    return (
      <section className="rounded-sm bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">บัญชีสมาชิก</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Stat label="Name" value={user.name} />
          <Stat label="Email" value={user.email} />
          <Stat label="Tier" value={user.tier} />
          <Stat label="Role" value={user.role} />
        </div>
        <button className="mt-5 h-10 rounded-sm bg-[#222222] px-5 text-sm font-bold text-white" onClick={onLogout}>
          Logout
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <form className="rounded-sm bg-white p-6 shadow-sm" onSubmit={onLogin}>
        <h2 className="text-xl font-black">Login</h2>
        <TextInput label="Email" value={loginForm.email} onChange={(value) => setLoginForm({ ...loginForm, email: value })} />
        <TextInput label="Password" type="password" value={loginForm.password} onChange={(value) => setLoginForm({ ...loginForm, password: value })} />
        <button className="mt-5 h-11 w-full rounded-sm bg-[#ee4d2d] text-sm font-bold text-white hover:bg-[#d73211]">Login</button>
      </form>

      <form className="rounded-sm bg-white p-6 shadow-sm" onSubmit={onRegister}>
        <h2 className="text-xl font-black">Register</h2>
        <TextInput label="Name" value={registerForm.name} onChange={(value) => setRegisterForm({ ...registerForm, name: value })} />
        <TextInput label="Email" value={registerForm.email} onChange={(value) => setRegisterForm({ ...registerForm, email: value })} />
        <TextInput label="Password" type="password" value={registerForm.password} onChange={(value) => setRegisterForm({ ...registerForm, password: value })} />
        <button className="mt-5 h-11 w-full rounded-sm bg-[#222222] text-sm font-bold text-white">Create Account</button>
      </form>
    </section>
  );
}

function AdminPanel({
  products,
  orders,
  total,
  onUpdateStock,
}: {
  products: Product[];
  orders: Order[];
  total: number;
  onUpdateStock: (product: Product, nextStock: number) => void;
}) {
  const lowStock = products.filter((product) => product.stock <= 10).length;

  return (
    <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-sm bg-[#222222] p-4 text-white shadow-sm">
        <h2 className="font-display text-2xl">Admin</h2>
        <div className="mt-5 grid gap-2 text-sm font-bold">
          <button className="admin-nav-active">Dashboard</button>
          <button className="admin-nav">Inventory</button>
          <button className="admin-nav">Orders</button>
          <button className="admin-nav">Warehouse</button>
          <button className="admin-nav">Finance</button>
        </div>
      </aside>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Products" value={String(products.length)} />
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Cart Value" value={`฿${total}`} />
          <Stat label="Low Stock" value={String(lowStock)} />
        </div>

        <section className="rounded-sm bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">จัดการสต็อกสินค้า</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
              <thead className="text-sm text-[#ee4d2d]">
                <tr>
                  <th>SKU/Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr className="bg-[#fafafa]" key={product.id}>
                    <td className="rounded-l-sm p-3 font-bold">{product.name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">฿{product.price}</td>
                    <td className="p-3">
                      <input
                        className="h-9 w-24 rounded-sm border border-[#eeeeee] px-3"
                        defaultValue={product.stock}
                        id={`stock-${product.id}`}
                        min="0"
                        type="number"
                      />
                    </td>
                    <td className="p-3">
                      <span className={`rounded-sm px-2 py-1 text-xs font-bold ${product.stock <= 10 ? "bg-[#222222] text-white" : "bg-white text-[#ee4d2d] border border-[#eeeeee]"}`}>
                        {product.stock <= 10 ? "Low" : "Ready"}
                      </span>
                    </td>
                    <td className="rounded-r-sm p-3">
                      <button
                        className="h-9 rounded-sm bg-[#ee4d2d] px-4 text-sm font-bold text-white hover:bg-[#d73211]"
                        onClick={() => {
                          const input = document.getElementById(`stock-${product.id}`) as HTMLInputElement | null;
                          onUpdateStock(product, Number(input?.value ?? product.stock));
                        }}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function TextInput({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-bold text-[#ee4d2d]">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-sm border border-[#eeeeee] bg-white px-4 outline-none focus:border-[#ee4d2d]"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ee4d2d]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
