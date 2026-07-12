"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateCartTotals, COMMERCE_CONFIG } from "@/src/shared/commerce";
import type {
  ProductColor,
  Product,
  User,
  CartItem,
  Order,
  Review,
  Coupon,
  StoreSettings,
  StockMovement,
} from "@/src/types";
import {
  initialProducts,
  initialReviews,
  defaultStoreSettings,
  paymentMethods,
} from "@/src/data/initialData";
import {
  formatMoney,
  formatOrderStatus,
  calculateCartSummary,
  normalizeImageUrl,
  getImageSrc,
  downloadTextFile,
  escapeHtml,
} from "@/src/utils";
import { TopBar } from "@/src/components/layout/TopBar";
import { StatusStrip } from "@/src/components/layout/StatusStrip";
import { BottomNav } from "@/src/components/layout/BottomNav";
import { CategoryRail } from "@/src/components/features/categories/CategoryRail";
import { CategoryChips } from "@/src/components/features/categories/CategoryChips";
import { HeroMall } from "@/src/components/features/home/HeroMall";
import { QuickMenu } from "@/src/components/features/home/QuickMenu";
import { ProductShelf } from "@/src/components/features/products/ProductShelf";
import { ProductCard } from "@/src/components/features/products/ProductCard";
import { ProductDetail } from "@/src/components/features/products/ProductDetail";
import { RightRail } from "@/src/components/features/cart/RightRail";
import { CheckoutPanel } from "@/src/components/features/cart/CheckoutPanel";
import { AccountPanel } from "@/src/components/features/account/AccountPanel";
import { AdminPanel } from "@/src/components/features/admin/AdminPanel";
import { BeautyStudio } from "@/src/components/features/studio/BeautyStudio";
import { renderStars } from "@/src/components/common/StarRating";


const DEMO_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_ADMIN === "true"
    ? "admin@luxea.test"
    : null;

// --- Component ---
export default function BeautyShopApp() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(() =>
    initialProducts.map((p) => ({ ...p, image: getImageSrc(p.image) })),
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [storeSettings, setStoreSettings] =
    useState<StoreSettings>(defaultStoreSettings);
  const [view, setView] = useState<
    | "home"
    | "studio"
    | "shop"
    | "wishlist"
    | "account"
    | "admin"
    | "checkout"
    | "product-detail"
  >("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailBackView, setDetailBackView] = useState<
    "home" | "shop" | "wishlist"
  >("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(
    defaultStoreSettings.enabledPaymentMethods[0],
  );
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [checkoutForm, setCheckoutForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
    shippingMethod: "standard" as const,
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneCountry: "TH",
    phoneNumber: "",
  });

  // --- Derived State ---
  const categories = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(products.map((item) => item.category))),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchedCategory =
        category === "ทั้งหมด" || product.category === category;
      const keyword =
        `${product.name} ${product.category} ${product.shade}`.toLowerCase();
      return matchedCategory && keyword.includes(search.toLowerCase().trim());
    });
  }, [category, products, search]);

  const cartSummary = useMemo(
    () =>
      calculateCartSummary({
        cart,
        products,
        coupon,
        settings: storeSettings,
      }),
    [cart, coupon, products, storeSettings],
  );

  const productReviews = useMemo(() => {
    if (!selectedProduct) return [];
    return reviews.filter((r) => r.productId === selectedProduct.id);
  }, [selectedProduct, reviews]);

  // --- Actions ---
  function addToCart(product: Product, colorId: string) {
    const colorStock =
      product.colors.find((c) => c.id === colorId)?.stock ?? product.stock;
    const maxQty = Math.min(product.stock, colorStock);
    if (maxQty < 1) {
      setMessage("สินค้าหมดสต็อกแล้ว");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.productId === product.id && item.colorId === colorId,
      );
      if (existing) {
        return currentCart.map((item) =>
          item.productId === product.id && item.colorId === colorId
            ? { ...item, quantity: Math.min(item.quantity + 1, maxQty) }
            : item,
        );
      }
      return [...currentCart, { productId: product.id, colorId, quantity: 1 }];
    });
    setMessage(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  }

  function toggleWishlist(productId: string) {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setMessage("กรุณากรอกโค้ดส่วนลด");
      return;
    }
    if (code === "LUXEA10") {
      setCoupon({ code: "LUXEA10", kind: "percent10" });
      setCouponInput("");
      setMessage("ใช้โค้ด LUXEA10 สำเร็จ (ลด 10% สูงสุด 200)");
      return;
    }
    if (code === "FREESHIP") {
      setCoupon({ code: "FREESHIP", kind: "freeship" });
      setCouponInput("");
      setMessage("ใช้โค้ด FREESHIP สำเร็จ (ส่งฟรี)");
      return;
    }
    setMessage("โค้ดไม่ถูกต้อง");
  }

  function clearCoupon() {
    setCoupon(null);
    setMessage("ยกเลิกโค้ดส่วนลดแล้ว");
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = loginForm.email.trim().toLowerCase();
    const isDemoAdmin =
      DEMO_ADMIN_EMAIL !== null && normalizedEmail === DEMO_ADMIN_EMAIL;
    const mockUser: User = {
      id: "admin-01",
      name: isDemoAdmin ? "LUXEA Admin" : "Customer",
      email: loginForm.email.trim(),
      role: isDemoAdmin ? "admin" : "customer",
      tier: "VIP",
      points: 1200,
    };
    setUser(mockUser);
    setCheckoutForm((prev) => ({
      ...prev,
      shippingName: prev.shippingName || mockUser.name,
    }));
    setView(mockUser.role === "admin" ? "admin" : "home");
    setMessage(`ยินดีต้อนรับ ${mockUser.name}`);
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = registerForm.name.trim();
    const trimmedEmail = registerForm.email.trim();
    const trimmedPassword = registerForm.password.trim();
    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: "customer",
      tier: "Member",
      points: 0,
    };
    setUser(newUser);
    setCheckoutForm((prev) => ({ ...prev, shippingName: trimmedName }));
    setRegisterForm({
      name: "",
      email: "",
      password: "",
      phoneCountry: "TH",
      phoneNumber: "",
    });
    setView("home");
    setMessage(`สมัครสมาชิกสำเร็จ ยินดีต้อนรับ ${newUser.name}`);
  }

  async function checkout() {
    if (!user) {
      setMessage("กรุณาล็อกอินก่อนชำระเงิน");
      setView("account");
      return;
    }
    if (cart.length === 0) {
      setMessage("ตะกร้าว่าง ไม่สามารถชำระเงินได้");
      return;
    }

    const shippingName = checkoutForm.shippingName.trim() || user.name;
    const shippingPhone = checkoutForm.shippingPhone.trim();
    const shippingAddress = checkoutForm.shippingAddress.trim();
    if (!shippingPhone || !shippingAddress) {
      setMessage("กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน");
      setView("checkout");
      return;
    }

    const normalizedCart: CartItem[] = [];
    let hadStockAdjust = false;
    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        hadStockAdjust = true;
        continue;
      }
      const color = product.colors.find((c) => c.id === item.colorId);
      const maxQty = Math.min(product.stock, color?.stock ?? product.stock);
      if (maxQty < 1) {
        hadStockAdjust = true;
        continue;
      }
      const nextQty = Math.min(item.quantity, maxQty);
      if (nextQty !== item.quantity) hadStockAdjust = true;
      normalizedCart.push({ ...item, quantity: nextQty });
    }
    if (hadStockAdjust) {
      setCart(normalizedCart);
      setMessage("สต็อกมีการเปลี่ยนแปลง ปรับตะกร้าให้ล่าสุดแล้ว");
      setView("checkout");
      return;
    }

    const summary = calculateCartSummary({
      cart: normalizedCart,
      products,
      coupon,
      settings: storeSettings,
    });
    const subtotal = summary.total;
    const discount = summary.discount;
    const shippingFee = summary.shipping;
    const total = summary.grandTotal;

    const nextStatus: Order["status"] =
      paymentMethod === "Credit Card"
        ? "paid"
        : paymentMethod === "Bank Transfer"
          ? "waiting_payment"
          : "cod";

    const createdAt = new Date().toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const order: Order = {
      id: `ORD-${Date.now()}`,
      customerName: user.name,
      items: normalizedCart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          if (!product) return null;
          const colorName =
            product.colors.find((c) => c.id === item.colorId)?.name ?? "";
          return {
            productId: item.productId,
            colorId: item.colorId,
            name: colorName ? `${product.name} (${colorName})` : product.name,
            quantity: item.quantity,
            price: product.price,
          };
        })
        .filter(Boolean) as Order["items"],
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingMethod: checkoutForm.shippingMethod,
      subtotal,
      discount,
      shippingFee,
      total,
      couponCode: coupon?.code,
      paymentMethod,
      status: nextStatus,
      createdAt,
    };

    setOrders((prev) => [order, ...prev]);

    setProducts((prev) =>
      prev.map((p) => {
        const byColor = normalizedCart.reduce<Record<string, number>>(
          (acc, it) => {
            if (it.productId !== p.id) return acc;
            acc[it.colorId] = (acc[it.colorId] ?? 0) + it.quantity;
            return acc;
          },
          {},
        );
        const hasAny = Object.keys(byColor).length > 0;
        if (!hasAny) return p;
        const nextColors = p.colors.map((c) => {
          const qty = byColor[c.id] ?? 0;
          if (!qty) return c;
          return { ...c, stock: Math.max(0, c.stock - qty) };
        });
        const nextTotalStock = nextColors.reduce((sum, c) => sum + c.stock, 0);
        return { ...p, colors: nextColors, stock: nextTotalStock };
      }),
    );

    setStockMovements((prev) => {
      const movementCreatedAt = new Date().toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      const next = normalizedCart
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const color = product?.colors.find((c) => c.id === item.colorId);
          if (!product) return null;
          return {
            id: `mov-${Date.now()}-${item.productId}-${item.colorId}`,
            createdAt: movementCreatedAt,
            productId: item.productId,
            productName: product.name,
            colorId: item.colorId,
            colorName: color?.name,
            delta: -item.quantity,
            reason: "order_checkout" as const,
            actor: user.name,
            note: order.id,
          };
        })
        .filter(Boolean) as StockMovement[];
      return [...next, ...prev];
    });

    setCart([]);
    setMessage(
      nextStatus === "paid"
        ? `สั่งซื้อสำเร็จ! เลขออเดอร์ ${order.id}`
        : nextStatus === "waiting_payment"
          ? `สร้างออเดอร์แล้ว ${order.id} กรุณาโอนเงินเพื่อยืนยัน`
          : `สร้างออเดอร์แล้ว ${order.id} ชำระเงินปลายทาง`,
    );
    setView("account");
  }

  // --- Loading Screen ---
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const shouldUseAdminTheme = user?.role === "admin" || view === "admin";
    document.documentElement.classList.toggle(
      "theme-admin",
      shouldUseAdminTheme,
    );
  }, [user?.role, view]);

  useEffect(() => {
    if (view !== "admin") return;
    if (user?.role === "admin") return;
    setMessage("ไม่มีสิทธิ์เข้าถึงหน้าแอดมิน");
    setView("home");
  }, [user?.role, view]);

  useEffect(() => {
    const enabled = storeSettings.enabledPaymentMethods;
    if (enabled.length === 0) return;
    if (enabled.includes(paymentMethod as any)) return;
    setPaymentMethod(enabled[0]);
  }, [paymentMethod, storeSettings.enabledPaymentMethods]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  // --- Render Star Rating ---
  // renderStars now comes from @/src/components/common/StarRating

  return (
    <main className="min-h-screen">
      {/* Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-neutral)]"
          >
            <div className="text-center">
              <div className="loader mx-auto mb-8">
                <div className="circle"></div>
              </div>
              <h2 className="font-display text-2xl text-[var(--color-primary)]">
                LOADING LUXEA...
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* --- Top Bar --- */}
            <TopBar
              cartCount={cartSummary.quantity}
              wishlistCount={wishlist.length}
              search={search}
              setSearch={setSearch}
              setView={setView}
              user={user}
            />

            <div className="w-full px-4 py-10 md:px-6 md:py-12 xl:px-10 2xl:px-12">
              <StatusStrip
                message={message}
                freeShippingThreshold={storeSettings.freeShippingThreshold}
                onDismiss={() => setMessage("")}
              />

              {/* --- Home View --- */}
              {view === "home" && (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <section className="space-y-6 min-w-0">
                    <HeroMall
                      setView={setView}
                      freeShippingThreshold={
                        storeSettings.freeShippingThreshold
                      }
                    />
                    <CategoryChips
                      categories={categories}
                      activeCategory={category}
                      setCategory={setCategory}
                    />
                    <div className="md:hidden">
                      <QuickMenu setView={setView} user={user} />
                    </div>
                    <ProductShelf
                      title="สินค้าแนะนำ"
                      products={filteredProducts}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      wishlist={wishlist}
                      renderStars={renderStars}
                      onViewProduct={(product) => {
                        setSelectedProduct(product);
                        setDetailBackView("home");
                        setView("product-detail");
                      }}
                    />
                  </section>
                  <RightRail
                    cart={cart}
                    products={products}
                    total={cartSummary.total}
                    shipping={cartSummary.shipping}
                    grandTotal={cartSummary.grandTotal}
                    user={user}
                    orders={orders}
                    setView={setView}
                  />
                </div>
              )}

              {/* --- Shop View --- */}
              {view === "shop" && (
                <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
                  <CategoryRail
                    categories={categories}
                    activeCategory={category}
                    setCategory={setCategory}
                  />
                  <section className="space-y-6 min-w-0">
                    <div className="glass p-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-2xl font-display text-[var(--color-text)]">
                          ร้านค้า
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          หมวดหมู่:{" "}
                          <span className="font-bold">{category}</span>
                        </p>
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        พบ {filteredProducts.length} รายการ
                      </div>
                    </div>
                    <CategoryChips
                      categories={categories}
                      activeCategory={category}
                      setCategory={setCategory}
                    />
                    <ProductShelf
                      title="สินค้าในร้าน"
                      products={filteredProducts}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      wishlist={wishlist}
                      renderStars={renderStars}
                      onViewProduct={(product) => {
                        setSelectedProduct(product);
                        setDetailBackView("shop");
                        setView("product-detail");
                      }}
                    />
                  </section>
                  <RightRail
                    cart={cart}
                    products={products}
                    total={cartSummary.total}
                    shipping={cartSummary.shipping}
                    grandTotal={cartSummary.grandTotal}
                    user={user}
                    orders={orders}
                    setView={setView}
                  />
                </div>
              )}

              {/* --- Product Detail View --- */}
              {view === "product-detail" && selectedProduct && (
                <ProductDetail
                  product={selectedProduct}
                  onAddToCart={addToCart}
                  onBuyNow={(product, colorId, quantity) => {
                    for (let i = 0; i < quantity; i++) {
                      addToCart(product, colorId);
                    }
                    setView("checkout");
                  }}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(selectedProduct.id)}
                  reviews={productReviews}
                  onBack={() => setView(detailBackView)}
                />
              )}

              {/* --- Studio View --- */}
              {view === "studio" && <BeautyStudio />}

              {/* --- Wishlist View --- */}
              {view === "wishlist" && (
                <div className="glass-xl p-8">
                  <h2 className="text-3xl font-display text-[var(--color-primary)] mb-6">
                    Wishlist ❤️
                  </h2>
                  {wishlist.length === 0 ? (
                    <p className="text-[var(--color-text-secondary)]">
                      ยังไม่มีสินค้าใน Wishlist
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {products
                        .filter((p) => wishlist.includes(p.id))
                        .map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            onToggleWishlist={toggleWishlist}
                            isWishlisted={true}
                            renderStars={renderStars}
                            onViewProduct={(p) => {
                              setSelectedProduct(p);
                              setDetailBackView("wishlist");
                              setView("product-detail");
                            }}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- Checkout View --- */}
              {view === "checkout" && (
                <CheckoutPanel
                  cart={cart}
                  products={products}
                  checkoutForm={checkoutForm}
                  setCheckoutForm={setCheckoutForm}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  enabledPaymentMethods={storeSettings.enabledPaymentMethods}
                  summary={cartSummary}
                  freeShippingThreshold={storeSettings.freeShippingThreshold}
                  onCheckout={checkout}
                  onUpdateQuantity={(productId, colorId, nextQuantity) =>
                    setCart((currentCart) =>
                      currentCart
                        .map((item) =>
                          item.productId === productId &&
                          item.colorId === colorId
                            ? {
                                ...item,
                                quantity: (() => {
                                  const product = products.find(
                                    (p) => p.id === productId,
                                  );
                                  const maxFromProduct =
                                    product?.stock ?? nextQuantity;
                                  const maxFromColor =
                                    product?.colors.find(
                                      (c) => c.id === colorId,
                                    )?.stock ?? maxFromProduct;
                                  const maxQty = Math.min(
                                    maxFromProduct,
                                    maxFromColor,
                                  );
                                  return Math.max(
                                    1,
                                    Math.min(nextQuantity, maxQty),
                                  );
                                })(),
                              }
                            : item,
                        )
                        .filter((item) => item.quantity > 0),
                    )
                  }
                  onRemove={(productId, colorId) =>
                    setCart((currentCart) =>
                      currentCart.filter(
                        (item) =>
                          !(
                            item.productId === productId &&
                            item.colorId === colorId
                          ),
                      ),
                    )
                  }
                />
              )}

              {/* --- Account View --- */}
              {view === "account" && (
                <AccountPanel
                  user={user}
                  orders={orders}
                  loginForm={loginForm}
                  registerForm={registerForm}
                  setLoginForm={setLoginForm}
                  setRegisterForm={setRegisterForm}
                  onLogin={login}
                  onRegister={register}
                  setView={setView}
                  onLogout={() => {
                    setUser(null);
                    setMessage("ออกจากระบบแล้ว");
                    setView("home");
                  }}
                />
              )}

              {/* --- Admin View --- */}
              {view === "admin" && (
                <AdminPanel
                  products={products}
                  orders={orders}
                  reviews={reviews}
                  stockMovements={stockMovements}
                  settings={storeSettings}
                  total={cartSummary.total}
                  setView={setView}
                  onUpdateStock={(product, nextStock) => {
                    const clamped = Math.max(0, Math.floor(nextStock));
                    const delta = clamped - product.stock;
                    setProducts((prev) =>
                      prev.map((p) => {
                        if (p.id !== product.id) return p;
                        if (p.colors.length === 0)
                          return { ...p, stock: clamped };
                        const currentSum = p.colors.reduce(
                          (sum, c) => sum + c.stock,
                          0,
                        );
                        if (currentSum <= 0) {
                          const nextColors = p.colors.map((c, idx) =>
                            idx === 0
                              ? { ...c, stock: clamped }
                              : { ...c, stock: 0 },
                          );
                          return { ...p, colors: nextColors, stock: clamped };
                        }
                        let remaining = clamped;
                        const nextColors = p.colors.map((c, idx) => {
                          const raw = (c.stock / currentSum) * clamped;
                          const next =
                            idx === p.colors.length - 1
                              ? remaining
                              : Math.floor(raw);
                          remaining = Math.max(0, remaining - next);
                          return { ...c, stock: next };
                        });
                        const nextTotal = nextColors.reduce(
                          (sum, c) => sum + c.stock,
                          0,
                        );
                        return { ...p, colors: nextColors, stock: nextTotal };
                      }),
                    );
                    if (delta !== 0) {
                      setStockMovements((prev) => [
                        {
                          id: `mov-${Date.now()}-${product.id}`,
                          createdAt: new Date().toLocaleString("th-TH", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                          productId: product.id,
                          productName: product.name,
                          delta,
                          reason: "manual_adjust",
                          actor: "Admin",
                        },
                        ...prev,
                      ]);
                    }
                    setMessage("อัปเดตสต็อกแล้ว");
                  }}
                  onUpdateColorStock={(productId, colorId, nextStock) => {
                    const clamped = Math.max(0, Math.floor(nextStock));
                    const now = new Date().toLocaleString("th-TH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const beforeProduct = products.find(
                      (p) => p.id === productId,
                    );
                    const beforeColor = beforeProduct?.colors.find(
                      (c) => c.id === colorId,
                    );
                    setProducts((prev) =>
                      prev.map((p) => {
                        if (p.id !== productId) return p;
                        const nextColors = p.colors.map((c) =>
                          c.id === colorId ? { ...c, stock: clamped } : c,
                        );
                        const nextTotal = nextColors.reduce(
                          (sum, c) => sum + c.stock,
                          0,
                        );
                        return { ...p, colors: nextColors, stock: nextTotal };
                      }),
                    );
                    if (beforeProduct && beforeColor) {
                      const delta = clamped - beforeColor.stock;
                      if (delta !== 0) {
                        setStockMovements((prev) => [
                          {
                            id: `mov-${Date.now()}-${productId}-${colorId}`,
                            createdAt: now,
                            productId,
                            productName: beforeProduct.name,
                            colorId,
                            colorName: beforeColor.name,
                            delta,
                            reason: "manual_adjust",
                            actor: "Admin",
                          },
                          ...prev,
                        ]);
                      }
                    }
                    setMessage("อัปเดตสต็อกเฉดสีแล้ว");
                  }}
                  onUpdateOrderStatus={(orderId, nextStatus) => {
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.id === orderId ? { ...o, status: nextStatus } : o,
                      ),
                    );
                  }}
                  onUpdateOrder={(orderId, patch) => {
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.id === orderId ? { ...o, ...patch } : o,
                      ),
                    );
                  }}
                  onUpdateProduct={(productId, patch) => {
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === productId ? { ...p, ...patch } : p,
                      ),
                    );
                    setMessage("อัปเดตข้อมูลสินค้าแล้ว");
                  }}
                  onUpdateReview={(reviewId, patch) => {
                    setReviews((prev) =>
                      prev.map((r) =>
                        r.id === reviewId ? { ...r, ...patch } : r,
                      ),
                    );
                    setMessage("อัปเดตรีวิวแล้ว");
                  }}
                  onDeleteReview={(reviewId) => {
                    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
                    setMessage("ลบรีวิวแล้ว");
                  }}
                  onUpdateSettings={(patch) => {
                    setStoreSettings((prev) => ({ ...prev, ...patch }));
                    setMessage("บันทึกการตั้งค่าแล้ว");
                  }}
                />
              )}
            </div>

            {/* --- Bottom Navigation (Mobile) --- */}
            <BottomNav
              view={view}
              setView={setView}
              cartCount={cartSummary.quantity}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

