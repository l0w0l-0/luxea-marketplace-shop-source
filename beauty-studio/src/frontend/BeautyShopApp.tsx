"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateCartTotals, COMMERCE_CONFIG } from "@/src/shared/commerce";

// --- Types ---
type ProductColor = {
  id: string;
  name: string;
  hex: string;
  undertone?: string;
  finish?: string;
  coverage?: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  category: string;
  shade: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  color: string;
  description: string;
  image: string;
  colors: ProductColor[];
  isPremium?: boolean;
  status?: "draft" | "published";
  tags?: Array<"Premium" | "New" | "Best Seller">;
  sortOrder?: number;
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
  colorId: string;
  quantity: number;
};

type Order = {
  id: string;
  customerName: string;
  items: Array<{
    productId: string;
    colorId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingMethod: "standard";
  trackingNumber?: string;
  trackingUrl?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: string;
  status:
    | "paid"
    | "waiting_payment"
    | "cod"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled";
  createdAt: string;
};

type Review = {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  skinTone?: string;
  createdAt: string;
  status?: "approved" | "pending" | "hidden";
};

type Coupon =
  | { code: "LUXEA10"; kind: "percent10" }
  | { code: "FREESHIP"; kind: "freeship" };

const DEMO_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_ADMIN === "true"
    ? "admin@luxea.test"
    : null;

type StoreSettings = {
  freeShippingThreshold: number;
  shippingFee: number;
  lowStockThreshold: number;
  enabledPaymentMethods: Array<
    "Credit Card" | "Bank Transfer" | "Cash On Delivery"
  >;
};

type StockMovement = {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  colorId?: string;
  colorName?: string;
  delta: number;
  reason: "manual_adjust" | "order_checkout";
  actor: string;
  note?: string;
};

// --- Initial Data ---
const initialProducts: Product[] = [
  {
    id: "lip-velvet-01",
    name: "Velvet Matte Lipstick",
    category: "Lipstick",
    shade: "Rosy Pink",
    price: 299,
    stock: 24,
    rating: 4.9,
    reviewCount: 128,
    color: "#D96483",
    description: "ลิปสติกเนื้อแมทท์ เกลี่ยง่าย ติดทนนาน ไม่แห้งปาก",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20velvet%20matte%20rose%20pink%20lipstick%20on%20elegant%20white%20background%20product%20photography&image_size=square_hd",
    isPremium: true,
    colors: [
      {
        id: "lip-1",
        name: "Rosy Pink",
        hex: "#D96483",
        undertone: "Cool",
        finish: "Matte",
        stock: 24,
      },
      {
        id: "lip-2",
        name: "Coral Red",
        hex: "#E2583E",
        undertone: "Warm",
        finish: "Matte",
        stock: 18,
      },
      {
        id: "lip-3",
        name: "Berry Wine",
        hex: "#7A283D",
        undertone: "Neutral",
        finish: "Matte",
        stock: 30,
      },
    ],
  },
  {
    id: "blush-soft-01",
    name: "Soft Cloud Blush",
    category: "Blush",
    shade: "Dusty Rose",
    price: 390,
    stock: 18,
    rating: 4.8,
    reviewCount: 92,
    color: "#E8B4B8",
    description: "บลัชออนเนื้อฝุ่นละเอียด ให้แก้มสีชมพูอ่อนโยน",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20dusty%20rose%20blush%20compact%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      {
        id: "blush-1",
        name: "Dusty Rose",
        hex: "#E8B4B8",
        undertone: "Cool",
        finish: "Satin",
        stock: 18,
      },
      {
        id: "blush-2",
        name: "Peach Coral",
        hex: "#F2A284",
        undertone: "Warm",
        finish: "Satin",
        stock: 22,
      },
    ],
  },
  {
    id: "glow-gold-01",
    name: "Premium Glow Highlighter",
    category: "Highlighter",
    shade: "Champagne Gold",
    price: 590,
    stock: 10,
    rating: 4.9,
    reviewCount: 156,
    color: "#D7B9AE",
    description: "ไฮไลเตอร์เนื้อชิมเมอร์ ให้ผิวสะท้อนแสงอย่างเป็นธรรมชาติ",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20champagne%20gold%20highlighter%20compact%20elegant%20product%20photography&image_size=square_hd",
    isPremium: true,
    colors: [
      {
        id: "high-1",
        name: "Champagne Gold",
        hex: "#D7B9AE",
        undertone: "Neutral",
        finish: "Shimmer",
        stock: 10,
      },
      {
        id: "high-2",
        name: "Rose Gold",
        hex: "#E2A49A",
        undertone: "Warm",
        finish: "Shimmer",
        stock: 15,
      },
    ],
  },
  {
    id: "base-silk-01",
    name: "Silk Skin Foundation",
    category: "Foundation",
    shade: "Neutral Beige",
    price: 690,
    stock: 15,
    rating: 4.7,
    reviewCount: 201,
    color: "#C68493",
    description: "ฟาวน์เดชันเนื้อบางเบา ปกปิดดี ให้ผิวเนียนนุ่ม",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20silk%20skin%20foundation%20bottle%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      {
        id: "found-1",
        name: "Fair Warm",
        hex: "#F5E1D3",
        undertone: "Warm",
        finish: "Natural",
        coverage: "Medium",
        stock: 15,
      },
      {
        id: "found-2",
        name: "Neutral Beige",
        hex: "#E3C8BC",
        undertone: "Neutral",
        finish: "Natural",
        coverage: "Medium",
        stock: 18,
      },
    ],
  },
  {
    id: "eye-soft-01",
    name: "Soft Glam Eyeshadow",
    category: "Eyeshadow",
    shade: "Rose Taupe",
    price: 450,
    stock: 22,
    rating: 4.8,
    reviewCount: 87,
    color: "#B98B8F",
    description: "อายแชโดว์เนื้อฝุ่นละเอียด เบลนดี มีเฉดสีที่ใช้ได้ทุกโอกาส",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20rose%20taupe%20eyeshadow%20palette%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      {
        id: "eye-1",
        name: "Rose Taupe",
        hex: "#B98B8F",
        undertone: "Cool",
        finish: "Matte",
        stock: 22,
      },
    ],
  },
  {
    id: "cleanser-rose-01",
    name: "Rose Jelly Cleanser",
    category: "Skincare",
    shade: "Gentle Rose",
    price: 320,
    stock: 31,
    rating: 4.6,
    reviewCount: 64,
    color: "#F1B8C2",
    description:
      "คลีนเซอร์เนื้อเจลลี่ กลิ่นกุหลาบ ช่วยล้างเครื่องสำอางและสิ่งสกปรก",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20rose%20jelly%20cleanser%20bottle%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      {
        id: "skin-1",
        name: "Gentle Rose",
        hex: "#F1B8C2",
        undertone: "Neutral",
        stock: 31,
      },
    ],
  },
];

const initialReviews: Review[] = [
  {
    id: "r1",
    userId: "u1",
    userName: "Sarah K.",
    productId: "lip-velvet-01",
    rating: 5,
    comment: "สีชมพูสวยมาก! ติดทนนาน ไม่แห้งปาก",
    skinTone: "ผิวขาว",
    createdAt: "2024-05-20",
    status: "approved",
  },
  {
    id: "r2",
    userId: "u2",
    userName: "Emma L.",
    productId: "lip-velvet-01",
    rating: 4,
    comment: "ดี แต่ราคาแพงไปหน่อย",
    skinTone: "ผิวสองสี",
    createdAt: "2024-06-01",
    status: "approved",
  },
];

const paymentMethods = ["Credit Card", "Bank Transfer", "Cash On Delivery"];

const defaultStoreSettings: StoreSettings = {
  freeShippingThreshold: COMMERCE_CONFIG.freeShippingThreshold,
  shippingFee: COMMERCE_CONFIG.shippingFee,
  lowStockThreshold: COMMERCE_CONFIG.lowStockThreshold,
  enabledPaymentMethods: ["Credit Card", "Bank Transfer", "Cash On Delivery"],
};

function formatOrderStatus(status: Order["status"]) {
  if (status === "waiting_payment") return "รอชำระ";
  if (status === "paid") return "ชำระแล้ว";
  if (status === "cod") return "ปลายทาง";
  if (status === "processing") return "กำลังเตรียมของ";
  if (status === "shipped") return "จัดส่งแล้ว";
  if (status === "completed") return "สำเร็จ";
  return "ยกเลิก";
}

function formatMoney(amount: number) {
  return `฿${amount.toLocaleString("th-TH")}`;
}

function calculateCartSummary(args: {
  cart: CartItem[];
  products: Product[];
  coupon: Coupon | null;
  settings: StoreSettings;
}) {
  const subtotal = args.cart.reduce((sum, item) => {
    const product = args.products.find((entry) => entry.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const quantity = args.cart.reduce((sum, item) => sum + item.quantity, 0);
  const discount =
    args.coupon?.kind === "percent10"
      ? Math.min(200, Math.round(subtotal * 0.1))
      : 0;
  const totals = calculateCartTotals({
    items: args.cart.map((item) => {
      const product = args.products.find((entry) => entry.id === item.productId);
      return {
        unitPrice: product?.price ?? 0,
        quantity: item.quantity,
      };
    }),
    discount,
    freeShippingThreshold: args.settings.freeShippingThreshold,
    shippingFee:
      args.coupon?.kind === "freeship" ? 0 : args.settings.shippingFee,
  });

  return {
    quantity: totals.itemCount,
    total: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    grandTotal: totals.total,
  };
}

function normalizeImageUrl(url: string) {
  if (!url) return url;
  return url.replaceAll("text-to-image", "text_to_image");
}

function getImageSrc(url: string) {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return normalized;
  if (normalized.startsWith("/")) return normalized;
  if (!/^https?:\/\//.test(normalized)) return normalized;
  return `/api/image?url=${encodeURIComponent(normalized)}`;
}

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
  const [paymentMethod, setPaymentMethod] = useState(
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
  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < Math.round(rating) ? "filled" : ""}`}
      >
        ★
      </span>
    ));
  }

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

// --- Sub-Components ---
function TopBar({
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

function StatusStrip({
  message,
  freeShippingThreshold,
  onDismiss,
}: {
  message: string;
  freeShippingThreshold: number;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-8 rounded-[var(--radius-2xl)] bg-white/70 backdrop-blur-xl px-6 py-4 text-sm shadow-sm border border-[var(--color-border)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50)] px-4 py-2 font-bold text-[var(--color-primary)]">
            ✅ คืนเงินหากไม่ตรงปก
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50)] px-4 py-2 font-bold text-[var(--color-primary)]">
            🚚 ส่งฟรีเมื่อครบ {formatMoney(freeShippingThreshold)}
          </span>
        </div>
        {message ? (
          <div className="flex items-center gap-3 md:max-w-[44%] md:justify-end">
            <div className="text-[var(--color-text-secondary)] md:text-right">
              {message}
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/70 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
              onClick={onDismiss}
              aria-label="ปิดข้อความแจ้งเตือน"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
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
  const categoryIcons: Record<string, string> = {
    ทั้งหมด: "🛍️",
    Lipstick: "💄",
    Blush: "🌸",
    Highlighter: "✨",
    Foundation: "🧴",
    Skincare: "🧖‍♀️",
    Eyeshadow: "🎨",
    Eye: "👁️",
    Setting: "💫",
    Face: "🧴",
    Tools: "🖌️",
  };
  return (
    <aside className="glass-xl p-6 hidden lg:block sticky top-24 self-start">
      <h2 className="mb-4 text-sm font-bold text-[var(--color-text)]">
        หมวดหมู่
      </h2>
      <div className="space-y-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`w-full flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-left text-sm font-medium transition-all ${
              item === activeCategory
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text)] hover:bg-[var(--color-primary-50)]"
            }`}
          >
            <span className="text-lg">{categoryIcons[item] || "🛍️"}</span>
            {item}
          </button>
        ))}
      </div>
    </aside>
  );
}

function CategoryChips({
  categories,
  activeCategory,
  setCategory,
}: {
  categories: string[];
  activeCategory: string;
  setCategory: (value: string) => void;
}) {
  return (
    <section className="glass p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-[var(--color-text)]">หมวดหมู่</p>
        <p className="text-sm font-bold text-[var(--color-primary)]">
          {activeCategory}
        </p>
      </div>
      <div className="mt-3 -mx-1 flex gap-2 overflow-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
              item === activeCategory
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-white/70 text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function HeroMall({
  setView,
  freeShippingThreshold,
}: {
  setView: (v: any) => void;
  freeShippingThreshold: number;
}) {
  const heroModelImage = getImageSrc(
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=editorial%20beauty%20portrait%20of%20a%20young%20woman%20soft%20glam%20makeup%20dewy%20skin%20warm%20ivory%20background%20luxury%20cosmetics%20campaign%20soft%20studio%20lighting%20high-end%20fashion%20photography%20ultra%20realistic&image_size=portrait_4_3",
  );

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-gradient-to-br from-[rgba(183,110,121,0.16)] via-[rgba(255,253,252,0.86)] to-[rgba(242,216,201,0.55)] p-8 shadow-[0_28px_90px_rgba(120,80,90,0.16)]">
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[rgba(183,110,121,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-[rgba(242,216,201,0.24)] blur-3xl" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="min-w-0">
            <div className="hero-kicker">
              <span>Rosy Edit</span>
              <span>•</span>
              <span>soft luxury</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
              <span className="soft-badge shrink-0">
                ✨ Best Seller
              </span>
              <span className="soft-badge shrink-0">
                🚚 ส่งฟรี
              </span>
              <span className="soft-badge shrink-0">
                🎟 สมาชิกลดเพิ่ม
              </span>
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display leading-tight text-[var(--color-text)]">
              นุ่มละมุนขึ้นอีก
              <span className="block text-[var(--color-primary)]">
                กับลุคชมพูแพงลดสูงสุด 45%
              </span>
            </h2>
            <p className="mt-4 text-[var(--color-text-secondary)]">
              เครื่องสำอางพรีเมียมสำหรับทุกลุคในโทน rosy, glossy, soft-focus
              ที่แต่งง่าย ดูน่ารัก และยังคงความหรูแบบ LUXEA
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => setView("shop")}>
                ช้อป rosy picks →
              </button>
              <button className="btn btn-secondary" onClick={() => setView("wishlist")}>
                ♡ เซฟลุคโปรด
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/70 bg-white/55 p-4 shadow-[0_22px_70px_rgba(120,80,90,0.14)] lg:pb-24">
              <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/70 bg-white">
                <img
                  src={heroModelImage}
                  alt="LUXEA campaign model"
                  className="h-[260px] w-full object-cover object-[center_top] md:h-[300px]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.20),transparent_60%)]" />
              </div>

              <div className="pointer-events-none mt-4 rounded-[var(--radius-xl)] border border-white/70 bg-white/78 px-5 py-4 shadow-md backdrop-blur-xl lg:absolute lg:left-1/2 lg:bottom-6 lg:mt-0 lg:min-w-[320px] lg:-translate-x-1/2">
                <p className="text-[10px] font-bold tracking-[0.24em] text-[var(--color-text-secondary)]">
                  LOVE NOTES
                </p>
                <div className="mt-2 grid grid-cols-3 gap-3 text-xs text-[var(--color-text)]">
                  <div className="text-center">
                    <p className="font-bold">ส่งฟรี</p>
                    <p className="mt-1 text-[var(--color-text-secondary)]">
                      {formatMoney(freeShippingThreshold)}+
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">ลองง่าย</p>
                    <p className="mt-1 text-[var(--color-text-secondary)]">7 วัน</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">ของแถม</p>
                    <p className="mt-1 text-[var(--color-text-secondary)]">VIP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <PromoCard title="VIP Beauty" text="ของแถมเฉพาะสมาชิก" tone="dark" />
        <PromoCard
          title="New Arrivals"
          text="สินค้าใหม่ประจำสัปดาห์"
          tone="gold"
        />
      </section>
    </div>
  );
}

function PromoCard({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "dark" | "gold";
}) {
  const bg =
    tone === "dark"
      ? "bg-gradient-to-br from-[var(--color-primary-700)] to-[var(--color-primary)]"
      : "bg-gradient-to-br from-[var(--color-accent)] via-[var(--color-secondary)] to-[#fffdfc]";
  const textColor = tone === "dark" ? "text-white" : "text-[var(--color-text)]";
  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[rgba(183,110,121,0.14)] p-6 shadow-[0_18px_55px_rgba(120,80,90,0.12)] ${bg} ${textColor}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">
        {title}
      </p>
      <p className="mt-2 text-xl font-bold">{text}</p>
      <div className="mt-4 h-2 rounded-full bg-white/40"></div>
    </div>
  );
}

function QuickMenu({
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

function ProductShelf({
  title = "สินค้า",
  products,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  renderStars,
  onViewProduct,
}: {
  title?: string;
  products: Product[];
  onAddToCart: (p: Product, c: string) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
  renderStars: (r: number) => JSX.Element;
  onViewProduct?: (p: Product) => void;
}) {
  return (
    <section className="glass-xl p-7">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {products.length} รายการ
          </p>
        </div>
        <div className="text-sm font-bold text-[var(--color-text-secondary)] hidden sm:block">
          เลือกสี · หยิบใส่ตะกร้า · ชำระเงิน
        </div>
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
              renderStars={renderStars}
              onViewProduct={onViewProduct}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  renderStars,
  onViewProduct,
}: {
  product: Product;
  onAddToCart: (p: Product, c: string) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  renderStars: (r: number) => JSX.Element;
  onViewProduct?: (p: Product) => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0].id,
  );
  const selectedColorOption =
    product.colors.find((color) => color.id === selectedColor) ?? product.colors[0];

  const badges = (() => {
    const list: Array<{ label: string; tone: "primary" | "soft" | "neutral" }> =
      [];
    const tagList = product.tags ?? [];
    if (tagList.includes("Best Seller")) list.push({ label: "Best Seller", tone: "primary" });
    if (tagList.includes("New")) list.push({ label: "New", tone: "soft" });
    if (product.stock > 0 && product.stock <= 10) list.push({ label: "Limited", tone: "neutral" });
    if (tagList.includes("Premium") || product.isPremium) list.push({ label: "Premium", tone: "neutral" });
    return list.slice(0, 2);
  })();

  return (
    <motion.article
      className="product-card group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div
        className="relative cursor-pointer"
        onClick={() => onViewProduct && onViewProduct(product)}
      >
        <ProductVisual product={product} />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.label}
              className={
                b.tone === "primary"
                  ? "inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[var(--color-primary)] border border-white/70 shadow-sm"
                  : b.tone === "soft"
                    ? "inline-flex items-center rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[var(--color-text)] border border-white/60 shadow-sm"
                    : "inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-bold text-[var(--color-text)] border border-[var(--color-border)] shadow-sm"
              }
            >
              {b.label}
            </span>
          ))}
        </div>
        <button
          className={`wishlist-btn absolute top-4 right-4 ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
            {product.category}
          </p>
          <div className="flex items-center gap-2">
            {renderStars(product.rating)}
            <span className="text-xs text-[var(--color-text-secondary)]">
              {product.rating.toFixed(1)} · {product.reviewCount}
            </span>
          </div>
        </div>

        <p
          className="mt-2 text-lg font-bold cursor-pointer leading-snug"
          onClick={() => onViewProduct && onViewProduct(product)}
        >
          {product.name}
        </p>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {product.colors.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`shade-chip ${c.id === selectedColor ? "active" : ""}`}
                  title={c.name}
                >
                  <span
                    className="shade-swatch"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden="true"
                  />
                  <span className="shade-meta">
                    <strong>{c.name}</strong>
                    <span>{c.finish ?? c.undertone ?? "Beauty Tone"}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)] shadow-sm">
            {product.stock > 0 ? `เหลือ ${product.stock}` : "หมดสต็อก"}
          </p>
        </div>

        <div
          className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 shadow-sm"
          style={{
            background:
              "linear-gradient(180deg, rgba(249, 241, 243, 0.95), rgba(255, 255, 255, 0.82))",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[var(--color-text)]">
              {selectedColorOption.name}
            </p>
            <span className="text-xs font-semibold text-[var(--color-primary)]">
              {selectedColorOption.hex}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {selectedColorOption.undertone ?? "Neutral"} ·{" "}
            {selectedColorOption.finish ?? "Soft Finish"}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="price-pill">
            <p className="text-2xl font-black text-[var(--color-primary)]">
              ฿{product.price}
            </p>
          </div>
          <button
            className="btn btn-primary h-11 px-5"
            disabled={product.stock === 0}
            onClick={() => onAddToCart(product, selectedColor)}
          >
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ProductVisual({ product }: { product: Product }) {
  return (
    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-neutral)]">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: product.color }}
      />
      <img
        src={getImageSrc(product.image)}
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
    </div>
  );
}

function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  reviews,
  onBack,
}: {
  product: Product;
  onAddToCart: (p: Product, c: string) => void;
  onBuyNow?: (p: Product, c: string, quantity: number) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  reviews: Review[];
  onBack: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0].id,
  );
  const [quantity, setQuantity] = useState(1);
  const selectedColorOption =
    product.colors.find((color) => color.id === selectedColor) ?? product.colors[0];

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* Left: Image and Gallery */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-4 hover:opacity-80"
        >
          ← กลับ
        </button>
        <div className="glass-xl rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--color-primary-50)] to-white p-6">
          <div className="relative w-full h-96 rounded-[var(--radius-xl)] overflow-hidden">
            <div
              className="absolute inset-0 opacity-25"
              style={{ backgroundColor: product.color }}
            />
            <img
              src={getImageSrc(product.image)}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.32),transparent_45%),linear-gradient(180deg,transparent_18%,rgba(58,46,46,0.08)_100%)]" />
          </div>
        </div>
      </div>

      {/* Right: Product Info */}
      <aside className="space-y-6 self-start lg:sticky lg:top-24">
        <div className="glass-xl rounded-[var(--radius-2xl)] p-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
              {product.category}
            </p>
            <button
              className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
              onClick={() => onToggleWishlist(product.id)}
            >
              {isWishlisted ? "❤️" : "🤍"}
            </button>
          </div>

          <h1 className="text-4xl font-display text-[var(--color-text)] mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`star ${i < Math.round(product.rating) ? "filled" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {product.rating} ({product.reviewCount} reviews)
            </span>
            {product.isPremium && (
              <span className="badge-premium">✨ Premium</span>
            )}
          </div>

          <p className="text-3xl font-black text-[var(--color-primary)] mb-6">
            ฿{product.price}
          </p>

          <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--color-primary)] mb-3">
              สี ({product.shade})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                    selectedColor === c.id
                      ? "border-[var(--color-primary)] bg-[linear-gradient(135deg,rgba(163,93,106,0.10),rgba(255,255,255,0.96))] shadow-[0_16px_34px_rgba(163,93,106,0.14)]"
                      : "border-[var(--color-border)] bg-white/82 hover:border-[rgba(163,93,106,0.26)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full shadow-md"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {c.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {c.hex}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[var(--color-text-secondary)]">
                    <span>{c.undertone ?? "Neutral"}</span>
                    <span>{c.finish ?? "Soft"}</span>
                    <span>{c.coverage ?? "Medium"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-primary-50)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Selected Shade
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span
                className="mt-1 h-4 w-4 rounded-full shadow-sm"
                style={{ backgroundColor: selectedColorOption.hex }}
              />
              <div>
                <p className="text-base font-bold text-[var(--color-text)]">
                  {selectedColorOption.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {selectedColorOption.hex} · {selectedColorOption.undertone ?? "Neutral"} ·{" "}
                  {selectedColorOption.finish ?? "Matte"} ·{" "}
                  {selectedColorOption.coverage ?? "Medium"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--color-primary)] mb-3">
              จำนวน
            </h3>
            <div className="flex items-center gap-3 glass p-3 rounded-[var(--radius-lg)] w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="btn btn-secondary w-10 h-10 p-0"
              >
                -
              </button>
              <span className="text-xl font-bold min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="btn btn-secondary w-10 h-10 p-0"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              className="btn btn-primary w-full text-lg h-14"
              disabled={product.stock === 0}
              onClick={() => {
                for (let i = 0; i < quantity; i++) {
                  onAddToCart(product, selectedColor);
                }
              }}
            >
              {product.stock === 0 ? "สินค้าหมด" : "หยิบใส่ตะกร้า"}
            </button>
            <button
              className="btn btn-secondary w-full text-lg h-14"
              disabled={product.stock === 0}
              onClick={() => onBuyNow?.(product, selectedColor, quantity)}
            >
              ซื้อตอนนี้
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-xl rounded-[var(--radius-2xl)] p-8">
          <h2 className="text-2xl font-display text-[var(--color-primary)] mb-6">
            รีวิวลูกค้า ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-[var(--color-text-secondary)]">
              ยังไม่มีรีวิวสำหรับสินค้านี้
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-200)] to-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-text)]">
                          {review.userName}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {review.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`star ${i < Math.round(review.rating) ? "filled" : ""}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}

function RightRail({
  cart,
  products,
  total,
  shipping,
  grandTotal,
  user,
  orders,
  setView,
}: {
  cart: CartItem[];
  products: Product[];
  total: number;
  shipping: number;
  grandTotal: number;
  user: User | null;
  orders: Order[];
  setView: (v: any) => void;
}) {
  return (
    <aside className="space-y-6 hidden lg:block sticky top-24 self-start">
      <Panel title="บัญชีของฉัน">
        {user ? (
          <div className="space-y-2">
            <p className="text-lg font-bold">{user.name}</p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  user.tier === "VIP"
                    ? "bg-[var(--color-accent)] text-[#4b3b33]"
                    : "bg-[var(--color-primary-50)] text-[var(--color-primary)]"
                }`}
              >
                {user.tier}
              </span>
              <span>· {user.points} points</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-text-secondary)]">
              เข้าสู่ระบบเพื่อสะสมแต้มและรับส่วนลดสมาชิก
            </p>
            <button className="btn btn-primary w-full" onClick={() => setView("account")}>
              เข้าสู่ระบบ
            </button>
            <button className="btn btn-secondary w-full" onClick={() => setView("account")}>
              สมัครสมาชิกใหม่
            </button>
          </div>
        )}
      </Panel>

      <Panel title="ตะกร้าสินค้า">
        {cart.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            ยังไม่มีสินค้าในตะกร้า
          </p>
        ) : (
          <div className="space-y-3">
            {cart.slice(0, 3).map((item) => {
              const product = products.find(
                (entry) => entry.id === item.productId,
              );
              const color = product?.colors.find((c) => c.id === item.colorId);
              if (!product) return null;
              const lineTotal = product.price * item.quantity;
              return (
                <div
                  key={`${item.productId}-${item.colorId}`}
                  className="flex items-center gap-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-white/70 bg-white shadow-sm">
                    <img
                      src={getImageSrc(product.image)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{ backgroundColor: product.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--color-text)] truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {color?.name ?? "-"} · x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black text-[var(--color-primary)]">
                    {formatMoney(lineTotal)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 border-t border-[var(--color-border)] pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">สินค้า</span>
            <span className="font-medium">฿{total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">
              ค่าจัดส่ง
            </span>
            <span
              className={
                shipping === 0
                  ? cart.length === 0
                    ? "font-medium text-[var(--color-text)]"
                    : "font-bold text-[var(--color-success)]"
                  : "font-medium"
              }
            >
              {shipping === 0
                ? cart.length === 0
                  ? formatMoney(0)
                  : "ฟรี"
                : formatMoney(shipping)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-black">
            <span>รวม</span>
            <span className="text-[var(--color-primary)]">฿{grandTotal}</span>
          </div>
          <button
            className="btn btn-primary w-full mt-4"
            onClick={() => setView("checkout")}
          >
            ไปหน้าชำระเงิน
          </button>
        </div>
      </Panel>

      <Panel title="โค้ดส่วนลด">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-4">
          <p className="text-xs font-bold text-[var(--color-text-secondary)]">
            โค้ดแนะนำ
          </p>
          <p className="mt-2 text-2xl font-black text-[var(--color-text)]">
            LUXEA10
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            ลดเพิ่ม 10% เมื่อสั่งซื้อขั้นต่ำ ฿500
          </p>
        </div>
        <button className="btn btn-secondary w-full mt-4" onClick={() => setView("checkout")}>
          ใช้โค้ดในหน้าชำระเงิน
        </button>
      </Panel>
    </aside>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass p-6">
      <h2 className="mb-4 border-b border-[var(--color-border)] pb-3 text-sm font-bold text-[var(--color-text)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PaymentMethodTabs({
  value,
  onChange,
  methods = paymentMethods,
}: {
  value: string;
  onChange: (next: string) => void;
  methods?: string[];
}) {
  const safeMethods = methods.length ? methods : paymentMethods;
  const selectedIndex = Math.max(0, safeMethods.indexOf(value));
  const gliderWidth = `${100 / Math.max(1, safeMethods.length)}%`;

  return (
    <div className="segmented-control">
      <div className="tabs">
        {safeMethods.map((method, index) => {
          const id = `radio-${index + 1}`;
          return (
            <div key={method} className="relative">
              <input
                type="radio"
                id={id}
                checked={value === method}
                onChange={() => onChange(method)}
              />
              <label className="tab" htmlFor={id}>
                {method === "Credit Card"
                  ? "Card"
                  : method === "Bank Transfer"
                    ? "Bank"
                    : "COD"}
              </label>
            </div>
          );
        })}
        <span
          className="glider"
          style={{
            width: gliderWidth,
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}

function PaymentFlipCard() {
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <div className="heading_8264">LUXEA</div>
          <div className="chip">
            <div className="h-8 w-12 rounded-md bg-gradient-to-br from-[#f6d6a7] to-[#caa36f] shadow" />
          </div>
          <div className="contactless">
            <div className="h-6 w-6 rounded-full border border-white/70" />
          </div>
          <div className="logo">
            <div className="h-8 w-12 rounded-full bg-white/10 ring-1 ring-white/20" />
          </div>
          <div className="number">4242 4242 4242 4242</div>
          <div className="valid_thru">VALID THRU</div>
          <div className="date_8264">12/29</div>
          <div className="name">LUXEA MEMBER</div>
        </div>
        <div className="flip-card-back">
          <div className="strip" />
          <div className="mstrip">
            <p className="code">123</p>
          </div>
          <div className="sstrip" />
        </div>
      </div>
    </div>
  );
}

function CheckoutPanel({
  cart,
  products,
  checkoutForm,
  setCheckoutForm,
  paymentMethod,
  setPaymentMethod,
  enabledPaymentMethods,
  summary,
  freeShippingThreshold,
  onCheckout,
  onUpdateQuantity,
  onRemove,
}: {
  cart: CartItem[];
  products: Product[];
  checkoutForm: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingMethod: "standard";
  };
  setCheckoutForm: (value: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingMethod: "standard";
  }) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  enabledPaymentMethods: Array<
    "Credit Card" | "Bank Transfer" | "Cash On Delivery"
  >;
  summary: {
    quantity: number;
    total: number;
    discount: number;
    shipping: number;
    grandTotal: number;
  };
  freeShippingThreshold: number;
  onCheckout: () => void;
  onUpdateQuantity: (
    productId: string,
    colorId: string,
    nextQuantity: number,
  ) => void;
  onRemove: (productId: string, colorId: string) => void;
}) {
  const safePaymentMethods = enabledPaymentMethods.length
    ? enabledPaymentMethods
    : (paymentMethods as Array<
        "Credit Card" | "Bank Transfer" | "Cash On Delivery"
      >);
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - summary.total);
  const freeShipProgress =
    freeShippingThreshold <= 0
      ? 100
      : Math.min(100, Math.round((summary.total / freeShippingThreshold) * 100));

  const canCheckout =
    cart.length > 0 &&
    Boolean(checkoutForm.shippingName.trim()) &&
    Boolean(checkoutForm.shippingPhone.trim()) &&
    Boolean(checkoutForm.shippingAddress.trim());

  const paymentMeta = (method: string) => {
    if (method === "Credit Card")
      return { icon: "💳", title: "Credit / debit card", subtitle: "Visa, Mastercard" };
    if (method === "Bank Transfer")
      return { icon: "🏦", title: "Bank transfer", subtitle: "โอนเงินผ่านธนาคาร" };
    return { icon: "🚚", title: "Cash on delivery", subtitle: "ชำระเงินปลายทาง" };
  };

  return (
    <section className="glass-xl p-6 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-3xl font-display leading-tight text-[var(--color-text)]">
            ตะกร้าสินค้า
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            เลือกวิธีชำระเงิน ตรวจสอบยอด และยืนยันคำสั่งซื้อ
          </p>
        </div>
        <div className="text-sm font-bold text-[var(--color-text-secondary)]">
          LUXEA · Secure Checkout
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="glass p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                Order Summary
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--color-text)]">
                {summary.quantity} item{summary.quantity === 1 ? "" : "s"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Due Today
              </p>
              <p className="mt-2 text-2xl font-black text-[var(--color-text)]">
                {formatMoney(summary.grandTotal)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-bold text-[var(--color-text)]">
                {formatMoney(summary.total)}
              </span>
            </div>
            {summary.discount > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--color-text-secondary)]">Discount</span>
                <span className="font-bold text-[var(--color-danger)]">
                  -{formatMoney(summary.discount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--color-text-secondary)]">Shipping</span>
              <span
                className={
                  summary.shipping === 0
                    ? summary.quantity === 0
                      ? "font-bold text-[var(--color-text)]"
                      : "font-black text-[var(--color-success)]"
                    : "font-bold text-[var(--color-text)]"
                }
              >
                {summary.shipping === 0
                  ? summary.quantity === 0
                    ? formatMoney(0)
                    : "ฟรี"
                  : formatMoney(summary.shipping)}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-[var(--color-text)]">
                ส่งฟรีเมื่อครบ
              </p>
              <p className="text-sm font-black text-[var(--color-text)]">
                {formatMoney(freeShippingThreshold)}
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[var(--color-primary-100)] overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                style={{ width: `${freeShipProgress}%` }}
              />
            </div>
            {remainingForFreeShip > 0 ? (
              <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-primary-50)] px-4 py-3 text-xs text-[var(--color-text)]">
                ซื้อเพิ่มอีก{" "}
                <span className="font-black text-[var(--color-primary)]">
                  {formatMoney(remainingForFreeShip)}
                </span>{" "}
                เพื่อรับส่งฟรี
              </div>
            ) : (
              <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-primary-50)] px-4 py-3 text-xs text-[var(--color-text)]">
                <span className="font-black text-[var(--color-success)]">
                  คุณได้รับสิทธิ์ส่งฟรีแล้ว
                </span>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary w-full mt-6"
            disabled={!canCheckout}
            aria-disabled={!canCheckout}
            onClick={onCheckout}
          >
            ยืนยันคำสั่งซื้อ
          </button>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            ชำระเงินปลอดภัย · ข้อมูลการจัดส่งใช้เพื่อออกใบจัดส่งและติดตามพัสดุ
          </p>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="glass p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Payment Method
                </p>
                <h3 className="mt-2 text-xl font-bold text-[var(--color-text)]">
                  เลือกวิธีชำระเงิน
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                เลือก 1 วิธี
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {safePaymentMethods.map((method) => {
                const meta = paymentMeta(method);
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    className={`w-full rounded-[var(--radius-xl)] border px-5 py-4 text-left transition ${
                      active
                        ? "border-[rgba(163,93,106,0.28)] bg-[rgba(163,93,106,0.10)]"
                        : "border-[var(--color-border)] bg-white/60 hover:bg-white/75"
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lg border border-white/60 shadow-sm">
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--color-text)] truncate">
                            {meta.title}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)] truncate">
                            {meta.subtitle}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border ${
                          active
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                            : "border-[var(--color-border)] bg-white/70"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {paymentMethod === "Credit Card" && (
              <div className="mt-6 flex justify-center">
                <PaymentFlipCard />
              </div>
            )}
          </section>

          <section className="glass p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Cart Items
                </p>
                <h3 className="mt-2 text-xl font-bold text-[var(--color-text)]">
                  รายการสินค้า
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {cart.length} รายการ
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-6 text-sm text-[var(--color-text-secondary)]">
                ตะกร้ายังว่าง
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {cart.map((item) => {
                  const product = products.find(
                    (entry) => entry.id === item.productId,
                  );
                  const color = product?.colors.find((c) => c.id === item.colorId);
                  if (!product) return null;
                  const lineTotal = product.price * item.quantity;
                  return (
                    <div
                      key={`${item.productId}-${item.colorId}`}
                      className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-white/60 bg-white/80 shadow-sm">
                            <div
                              className="absolute inset-0 opacity-30"
                              style={{ backgroundColor: product.color }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-lg">
                              {product.category === "Lipstick" && "💄"}
                              {product.category === "Blush" && "🌸"}
                              {product.category === "Highlighter" && "✨"}
                              {product.category === "Foundation" && "🎨"}
                              {product.category === "Eyeshadow" && "👁️"}
                              {product.category === "Skincare" && "🧴"}
                              {product.category === "Eye" && "👁️"}
                              {product.category === "Setting" && "💨"}
                              {product.category === "Face" && "🧴"}
                              {product.category === "Tools" && "🖌️"}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--color-text)] truncate">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-text-secondary)] truncate">
                              Shade: {color?.name ?? "-"}
                            </p>
                          </div>
                        </div>
                        <button
                          className="btn btn-secondary h-10 px-4"
                          onClick={() => onRemove(item.productId, item.colorId)}
                        >
                          ลบ
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex w-full sm:w-auto items-center justify-between gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-2">
                          <button
                            className="btn btn-secondary h-10 w-10 p-0"
                            onClick={() =>
                              onUpdateQuantity(
                                item.productId,
                                item.colorId,
                                item.quantity - 1,
                              )
                            }
                          >
                            -
                          </button>
                          <span className="min-w-[2.5rem] text-center text-sm font-black text-[var(--color-text)]">
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-secondary h-10 w-10 p-0"
                            onClick={() =>
                              onUpdateQuantity(
                                item.productId,
                                item.colorId,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                            Total
                          </p>
                          <p className="mt-1 text-lg font-black text-[var(--color-primary)]">
                            {formatMoney(lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="glass p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Shipping Details
            </p>
            <h3 className="mt-2 text-xl font-bold text-[var(--color-text)]">
              ข้อมูลจัดส่ง
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                  ชื่อผู้รับ
                </span>
                <input
                  className="input mt-2 w-full text-sm text-[var(--color-text)]"
                  value={checkoutForm.shippingName}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, shippingName: e.target.value })
                  }
                  placeholder="ชื่อ-นามสกุล"
                />
              </label>
              <label className="block min-w-0">
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                  เบอร์โทร
                </span>
                <input
                  className="input mt-2 w-full text-sm text-[var(--color-text)]"
                  value={checkoutForm.shippingPhone}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, shippingPhone: e.target.value })
                  }
                  placeholder="0XX-XXX-XXXX"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                ที่อยู่
              </span>
              <textarea
                className="input mt-2 w-full px-4 py-3 text-sm text-[var(--color-text)] min-h-[96px]"
                value={checkoutForm.shippingAddress}
                onChange={(e) =>
                  setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value })
                }
                placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
              />
            </label>
          </section>
        </div>
      </div>
    </section>
  );
}

function AccountPanel({
  user,
  orders,
  loginForm,
  registerForm,
  setLoginForm,
  setRegisterForm,
  onLogin,
  onRegister,
  setView,
  onLogout,
}: {
  user: User | null;
  orders: Order[];
  loginForm: { email: string; password: string };
  registerForm: {
    name: string;
    email: string;
    password: string;
    phoneCountry: string;
    phoneNumber: string;
  };
  setLoginForm: (value: { email: string; password: string }) => void;
  setRegisterForm: (value: {
    name: string;
    email: string;
    password: string;
    phoneCountry: string;
    phoneNumber: string;
  }) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
  setView: (v: any) => void;
  onLogout: () => void;
}) {
  if (user) {
    const myOrders =
      user.role === "customer"
        ? orders.filter((o) => o.customerName === user.name)
        : orders;

    return (
      <section className="glass-xl p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-display text-[var(--color-text)]">
              บัญชีของฉัน
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {user.role === "admin" ? "บัญชีผู้ดูแลระบบ" : "บัญชีลูกค้า"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.role === "admin" && (
              <span className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-4 py-2 text-sm font-bold text-[var(--color-primary)]">
                Admin Mode
              </span>
            )}
            {user.role === "admin" && (
              <button
                className="btn btn-primary h-11 px-5"
                onClick={() => setView("admin")}
              >
                ไปหน้า Admin
              </button>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Stat label="ชื่อ" value={user.name} />
          <Stat label="อีเมล" value={user.email} />
          <Stat label="Tier" value={user.tier} />
          <Stat label="Points" value={`${user.points} points`} />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-display text-[var(--color-text)]">
            {user.role === "admin" ? "ออเดอร์ล่าสุด" : "คำสั่งซื้อของฉัน"}
          </h3>
          <div className="mt-4 grid gap-3">
            {myOrders.length === 0 ? (
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 text-sm text-[var(--color-text-secondary)]">
                ยังไม่มีคำสั่งซื้อ
              </div>
            ) : (
              myOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {order.id}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {order.createdAt} · {order.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-sm font-bold text-[var(--color-text-secondary)]">
                        {formatOrderStatus(order.status)}
                      </span>
                      <span className="text-xl font-black text-[var(--color-primary)]">
                        ฿{order.total}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button className="btn btn-secondary" onClick={onLogout}>
          ออกจากระบบ
        </button>
      </section>
    );
  }

  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start">
      <div className="glass h-fit p-8">
        <h2 className="text-3xl font-display text-[var(--color-text)]">
          เข้าสู่ระบบ / สมัครสมาชิก
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          ระบบแยกบทบาทลูกค้าและแอดมิน ใช้งานง่าย ปลอดภัย และรวดเร็ว
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5">
            <p className="text-sm font-bold text-[var(--color-text)]">ลูกค้า</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              ช้อปสินค้า · Wishlist · รีวิว · ชำระเงิน
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5">
            <p className="text-sm font-bold text-[var(--color-text)]">แอดมิน</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              จัดการสต็อก · ดูออเดอร์ · ตรวจสถานะ
            </p>
          </div>
        </div>
      </div>

      <div className="glass-xl p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-2xl font-display text-[var(--color-text)]">
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </h3>
          <div className="segmented-control">
            <div className="tabs">
              <input
                type="radio"
                id="radio-1"
                checked={mode === "login"}
                onChange={() => setMode("login")}
              />
              <label className="tab" htmlFor="radio-1">
                Login
              </label>
              <input
                type="radio"
                id="radio-2"
                checked={mode === "register"}
                onChange={() => setMode("register")}
              />
              <label className="tab" htmlFor="radio-2">
                Register
              </label>
              <span
                className="glider"
                style={{
                  width: "50%",
                  transform: `translateX(${mode === "login" ? 0 : 100}%)`,
                }}
              />
            </div>
          </div>
        </div>

        {mode === "login" ? (
          <form className="mt-6" onSubmit={onLogin}>
            <TextInput
              label="อีเมล"
              placeholder="you@email.com"
              value={loginForm.email}
              onChange={(value) => setLoginForm({ ...loginForm, email: value })}
            />
            <TextInput
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่าน"
              type="password"
              value={loginForm.password}
              onChange={(value) =>
                setLoginForm({ ...loginForm, password: value })
              }
            />
            <button className="btn btn-primary w-full mt-6">เข้าสู่ระบบ</button>
          </form>
        ) : (
          <form className="mt-6" onSubmit={onRegister}>
            <TextInput
              label="ชื่อ"
              value={registerForm.name}
              onChange={(value) =>
                setRegisterForm({ ...registerForm, name: value })
              }
            />
            <TextInput
              label="อีเมล"
              value={registerForm.email}
              onChange={(value) =>
                setRegisterForm({ ...registerForm, email: value })
              }
            />
            <TextInput
              label="รหัสผ่าน"
              type="password"
              value={registerForm.password}
              onChange={(value) =>
                setRegisterForm({ ...registerForm, password: value })
              }
            />

            <PhoneInput
              label="เบอร์โทร"
              country={registerForm.phoneCountry}
              number={registerForm.phoneNumber}
              onChangeCountry={(country) =>
                setRegisterForm({ ...registerForm, phoneCountry: country })
              }
              onChangeNumber={(number) =>
                setRegisterForm({ ...registerForm, phoneNumber: number })
              }
            />

            <button className="btn btn-secondary w-full mt-6">
              สมัครสมาชิก
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function AdminPanel({
  products,
  orders,
  reviews,
  stockMovements,
  settings,
  total,
  setView,
  onUpdateStock,
  onUpdateColorStock,
  onUpdateOrderStatus,
  onUpdateOrder,
  onUpdateProduct,
  onUpdateReview,
  onDeleteReview,
  onUpdateSettings,
}: {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  stockMovements: StockMovement[];
  settings: StoreSettings;
  total: number;
  setView: (v: any) => void;
  onUpdateStock: (product: Product, nextStock: number) => void;
  onUpdateColorStock: (
    productId: string,
    colorId: string,
    nextStock: number,
  ) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: Order["status"]) => void;
  onUpdateOrder: (orderId: string, patch: Partial<Order>) => void;
  onUpdateProduct: (productId: string, patch: Partial<Product>) => void;
  onUpdateReview: (reviewId: string, patch: Partial<Review>) => void;
  onDeleteReview: (reviewId: string) => void;
  onUpdateSettings: (patch: Partial<StoreSettings>) => void;
}) {
  const [tab, setTab] = useState<
    | "dashboard"
    | "products"
    | "inventory"
    | "orders"
    | "customers"
    | "reviews"
    | "reports"
    | "settings"
  >("dashboard");
  const [inventorySearch, setInventorySearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<"all" | Order["status"]>(
    "all",
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatus, setReviewStatus] = useState<
    "all" | NonNullable<Review["status"]>
  >("all");

  const lowStock = products.filter(
    (product) => product.stock <= settings.lowStockThreshold,
  ).length;
  const filteredInventory = useMemo(() => {
    const keyword = inventorySearch.toLowerCase().trim();
    return products.filter((p) => {
      const matchedKeyword =
        !keyword ||
        `${p.name} ${p.category} ${p.shade}`.toLowerCase().includes(keyword);
      const matchedStock =
        !lowStockOnly || p.stock <= settings.lowStockThreshold;
      return matchedKeyword && matchedStock;
    });
  }, [inventorySearch, lowStockOnly, products, settings.lowStockThreshold]);

  const filteredOrders = useMemo(() => {
    const keyword = orderSearch.toLowerCase().trim();
    return orders
      .filter((o) => (orderStatus === "all" ? true : o.status === orderStatus))
      .filter((o) => {
        if (!keyword) return true;
        return `${o.id} ${o.customerName} ${o.paymentMethod} ${o.trackingNumber ?? ""} ${o.shippingPhone ?? ""}`
          .toLowerCase()
          .includes(keyword);
      });
  }, [orderSearch, orderStatus, orders]);

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.toLowerCase().trim();
    if (!keyword) return products;
    return products.filter((p) =>
      `${p.name} ${p.category} ${p.shade}`.toLowerCase().includes(keyword),
    );
  }, [productSearch, products]);

  const filteredReviews = useMemo(() => {
    const keyword = reviewSearch.toLowerCase().trim();
    return reviews
      .filter((r) => {
        const status = r.status ?? "approved";
        if (reviewStatus === "all") return true;
        return status === reviewStatus;
      })
      .filter((r) => {
        if (!keyword) return true;
        return `${r.userName} ${r.comment}`.toLowerCase().includes(keyword);
      });
  }, [reviewSearch, reviewStatus, reviews]);

  const selectedOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : null;

  const customers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; orderCount: number; spent: number; lastOrderAt: string }
    >();
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const current = map.get(o.customerName);
      if (!current) {
        map.set(o.customerName, {
          name: o.customerName,
          orderCount: 1,
          spent: o.total,
          lastOrderAt: o.createdAt,
        });
        return;
      }
      map.set(o.customerName, {
        name: o.customerName,
        orderCount: current.orderCount + 1,
        spent: current.spent + o.total,
        lastOrderAt: current.lastOrderAt,
      });
    });
    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const key = o.createdAt.split(" ")[0] ?? o.createdAt;
      map.set(key, (map.get(key) ?? 0) + o.total);
    });
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; total: number }>();
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      o.items.forEach((it) => {
        const current = map.get(it.productId);
        const addTotal = it.price * it.quantity;
        if (!current) {
          map.set(it.productId, {
            name: it.name,
            qty: it.quantity,
            total: addTotal,
          });
          return;
        }
        map.set(it.productId, {
          name: current.name,
          qty: current.qty + it.quantity,
          total: current.total + addTotal,
        });
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders]);

  const adminTabs: Array<{
    id:
      | "dashboard"
      | "products"
      | "inventory"
      | "orders"
      | "customers"
      | "reviews"
      | "reports"
      | "settings";
    label: string;
    eyebrow: string;
    icon: string;
  }> = [
    { id: "dashboard", label: "Control Center", eyebrow: "Overview", icon: "◈" },
    { id: "products", label: "Products", eyebrow: "Catalog", icon: "✦" },
    { id: "inventory", label: "Inventory", eyebrow: "Stock", icon: "◌" },
    { id: "orders", label: "Orders", eyebrow: "Fulfillment", icon: "→" },
    { id: "customers", label: "Customers", eyebrow: "CRM", icon: "◎" },
    { id: "reviews", label: "Reviews", eyebrow: "Content", icon: "✳" },
    { id: "reports", label: "Reports", eyebrow: "Revenue", icon: "◫" },
    { id: "settings", label: "Settings", eyebrow: "System", icon: "⋯" },
  ];

  const activeTabMeta =
    adminTabs.find((item) => item.id === tab) ?? adminTabs[0];
  const paidOrders = orders.filter((o) =>
    ["paid", "processing", "shipped", "completed", "cod"].includes(o.status),
  );
  const processingOrders = orders.filter((o) =>
    ["waiting_payment", "paid", "processing", "cod"].includes(o.status),
  ).length;
  const pendingReviews = reviews.filter((r) => (r.status ?? "approved") === "pending").length;
  const conversionValue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  function exportOrdersCsv() {
    const header = [
      "order_id",
      "created_at",
      "customer_name",
      "status",
      "payment_method",
      "shipping_name",
      "shipping_phone",
      "shipping_address",
      "tracking_number",
      "subtotal",
      "discount",
      "shipping_fee",
      "total",
      "coupon_code",
      "items",
    ];
    const lines = filteredOrders.map((o) => {
      const items = o.items
        .map((it) => `${it.name} x${it.quantity} (${it.price})`)
        .join(" | ");
      const row = [
        o.id,
        o.createdAt,
        o.customerName,
        o.status,
        o.paymentMethod,
        o.shippingName,
        o.shippingPhone,
        o.shippingAddress,
        o.trackingNumber ?? "",
        String(o.subtotal),
        String(o.discount),
        String(o.shippingFee),
        String(o.total),
        o.couponCode ?? "",
        items,
      ].map((v) => `"${String(v).replaceAll('"', '""')}"`);
      return row.join(",");
    });
    downloadTextFile(
      `luxea-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      [header.join(","), ...lines].join("\n"),
      "text/csv;charset=utf-8",
    );
  }

  function printOrder(order: Order, kind: "receipt" | "shipping") {
    const title = kind === "receipt" ? "ใบเสร็จรับเงิน" : "ใบจัดส่ง";
    const itemsHtml = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(it.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${it.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(
            formatMoney(it.price * it.quantity),
          )}</td>
        </tr>
      `,
      )
      .join("");
    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)} ${escapeHtml(order.id)}</title>
      </head>
      <body style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a; padding:24px;">
        <div style="max-width:780px;margin:0 auto;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
            <div>
              <div style="font-size:12px;letter-spacing:.18em;font-weight:800;color:#64748b;">LUXEA</div>
              <h1 style="margin:8px 0 0;font-size:28px;">${escapeHtml(title)}</h1>
              <div style="margin-top:8px;color:#475569;font-size:13px;">
                เลขออเดอร์: <b>${escapeHtml(order.id)}</b> · วันที่: ${escapeHtml(
                  order.createdAt,
                )}
              </div>
            </div>
            <div style="text-align:right;color:#475569;font-size:13px;">
              สถานะ: <b>${escapeHtml(formatOrderStatus(order.status))}</b><br/>
              ชำระเงิน: <b>${escapeHtml(order.paymentMethod)}</b><br/>
              Tracking: <b>${escapeHtml(order.trackingNumber ?? "-")}</b>
            </div>
          </div>

          <div style="margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
              <div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#64748b;">ผู้รับ</div>
              <div style="margin-top:8px;font-weight:800;">${escapeHtml(order.shippingName)}</div>
              <div style="margin-top:4px;color:#475569;">${escapeHtml(order.shippingPhone)}</div>
              <div style="margin-top:8px;color:#0f172a;white-space:pre-wrap;">${escapeHtml(
                order.shippingAddress,
              )}</div>
            </div>
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
              <div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#64748b;">สรุปยอด</div>
              <div style="margin-top:10px;display:flex;justify-content:space-between;color:#475569;">
                <span>สินค้า</span><b>${escapeHtml(formatMoney(order.subtotal))}</b>
              </div>
              <div style="margin-top:6px;display:flex;justify-content:space-between;color:#475569;">
                <span>ส่วนลด</span><b style="color:#b91c1c;">-${escapeHtml(
                  formatMoney(order.discount),
                )}</b>
              </div>
              <div style="margin-top:6px;display:flex;justify-content:space-between;color:#475569;">
                <span>ค่าจัดส่ง</span><b>${escapeHtml(
                  order.shippingFee === 0
                    ? "ฟรี"
                    : formatMoney(order.shippingFee),
                )}</b>
              </div>
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:18px;">
                <span style="font-weight:900;">รวมสุทธิ</span><span style="font-weight:900;color:#a35d6a;">${escapeHtml(
                  formatMoney(order.total),
                )}</span>
              </div>
            </div>
          </div>

          <div style="margin-top:18px;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#64748b;">รายการสินค้า</div>
            <table style="width:100%;border-collapse:collapse;margin-top:10px;">
              <thead>
                <tr style="text-align:left;color:#64748b;font-size:12px;">
                  <th style="padding:6px 0;">สินค้า</th>
                  <th style="padding:6px 0;text-align:right;">จำนวน</th>
                  <th style="padding:6px 0;text-align:right;">รวม</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="margin-top:18px;color:#64748b;font-size:12px;">
            ${kind === "receipt" ? "ขอบคุณที่เลือก LUXEA" : "โปรดตรวจสอบที่อยู่และเบอร์โทรก่อนจัดส่ง"}
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>`;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,253,252,0.86))] p-4 md:p-5 shadow-[0_28px_120px_rgba(120,80,90,0.16)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_560px_at_8%_12%,rgba(183,110,121,0.12),transparent_58%),radial-gradient(900px_560px_at_92%_18%,rgba(242,216,201,0.18),transparent_62%),radial-gradient(800px_480px_at_55%_92%,rgba(232,199,204,0.14),transparent_62%)]" />
      <div className="relative grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.26))] p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(120,80,90,0.12)] xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(183,110,121,0.82),rgba(164,93,104,0.92))] p-5 text-white shadow-[0_24px_60px_rgba(183,110,121,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                  LUXEA OS
                </p>
                <h2 className="mt-2 font-display text-3xl leading-none">
                  Control Suite
                </h2>
                <p className="mt-3 text-sm text-white/78">
                  Luxury operations for beauty, orders and experience design
                </p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/12 text-lg backdrop-blur-xl">
                ✦
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/14 bg-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Revenue
                </p>
                <p className="mt-2 text-xl font-black">
                  {formatMoney(conversionValue)}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/14 bg-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Queue
                </p>
                <p className="mt-2 text-xl font-black">{processingOrders}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] border border-white/60 bg-white/40 p-3 backdrop-blur-2xl">
            <div className="grid gap-2">
              {adminTabs.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`group w-full rounded-[22px] px-4 py-4 text-left transition-all ${
                      active
                        ? "bg-[linear-gradient(180deg,rgba(183,110,121,0.18),rgba(183,110,121,0.08))] shadow-[0_14px_34px_rgba(120,80,90,0.10)]"
                        : "hover:bg-white/55"
                    }`}
                    onClick={() => setTab(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-black ${
                          active
                            ? "border-[rgba(183,110,121,0.24)] bg-[var(--color-primary)] text-white"
                            : "border-white/60 bg-white/65 text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                          {item.eyebrow}
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-[var(--color-text)]">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button
              className="btn btn-primary w-full"
              onClick={() => setView("home")}
            >
              กลับหน้าร้าน
            </button>
            <button
              className="btn btn-secondary w-full"
              onClick={() => setView("account")}
            >
              ไปหน้าบัญชี
            </button>
          </div>
        </aside>

        <div className="space-y-6 min-w-0">
          <section className="relative overflow-hidden rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.34))] p-6 md:p-7 backdrop-blur-2xl shadow-[0_20px_65px_rgba(120,80,90,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_340px_at_10%_0%,rgba(183,110,121,0.12),transparent_60%),radial-gradient(700px_340px_at_92%_12%,rgba(242,216,201,0.16),transparent_62%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--color-text-secondary)]">
                  {activeTabMeta.eyebrow}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/70 text-xl text-[var(--color-primary)] shadow-sm">
                    {activeTabMeta.icon}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-4xl leading-none text-[var(--color-text)]">
                      {activeTabMeta.label}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      ระบบหลังบ้านแบบ premium control center สำหรับ LUXEA
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Products
                  </p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-text)]">
                    {products.length}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Alerts
                  </p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-text)]">
                    {lowStock + pendingReviews}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Orders
                  </p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-text)]">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-6 min-w-0">
        {tab === "dashboard" && (
          <>
            <div className="glass p-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-display text-[var(--color-text)]">
                  Dashboard
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  ภาพรวมระบบหลังบ้านและงานที่ต้องจัดการ
                </p>
              </div>
              <div className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-4 py-2 text-sm font-bold text-[var(--color-primary)]">
                Theme: Admin
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="สินค้าทั้งหมด" value={String(products.length)} />
              <Stat label="ออเดอร์" value={String(orders.length)} />
              <Stat label="Cart Value" value={`฿${total}`} />
              <Stat label="สินค้าใกล้หมด" value={String(lowStock)} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="glass-xl p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-display text-[var(--color-text)]">
                      สินค้าใกล้หมด
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      รายการที่ควรเติมสต็อก
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary h-11 px-5"
                    onClick={() => setTab("inventory")}
                  >
                    ไปหน้า Inventory
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {products
                    .filter((p) => p.stock <= settings.lowStockThreshold)
                    .slice(0, 5).length === 0 ? (
                    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 text-sm text-[var(--color-text-secondary)]">
                      ไม่มีสินค้าใกล้หมด
                    </div>
                  ) : (
                    products
                      .filter((p) => p.stock <= settings.lowStockThreshold)
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-bold truncate">{p.name}</p>
                              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                {p.category}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-[var(--color-danger)] px-4 py-2 text-sm font-bold text-white">
                              เหลือ {p.stock}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>

              <section className="glass-xl p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-display text-[var(--color-text)]">
                      ออเดอร์ล่าสุด
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      ตรวจสอบสถานะและการชำระเงิน
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary h-11 px-5"
                    onClick={() => setTab("orders")}
                  >
                    ไปหน้า Orders
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {orders.slice(0, 5).length === 0 ? (
                    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 text-sm text-[var(--color-text-secondary)]">
                      ยังไม่มีออเดอร์
                    </div>
                  ) : (
                    orders.slice(0, 5).map((o) => (
                      <button
                        key={o.id}
                        className="w-full text-left rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5 hover:bg-white/90 transition"
                        onClick={() => {
                          setSelectedOrderId(o.id);
                          setTab("orders");
                        }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-bold truncate">{o.id}</p>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                              {o.customerName} · {o.createdAt}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[var(--color-text-secondary)]">
                              {formatOrderStatus(o.status)}
                            </p>
                            <p className="text-lg font-black text-[var(--color-primary)]">
                              ฿{o.total}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {tab === "products" && (
          <section className="glass-xl p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-display text-[var(--color-text)]">
                  Product Management
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  แก้ไขสินค้า · สถานะขาย · แท็ก · สต็อกแยกตามเฉด
                </p>
              </div>
              <input
                className="input h-11 w-full md:w-80 px-4 text-sm"
                placeholder="ค้นหาชื่อสินค้า/หมวด/เฉดสี..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left">
                <thead className="text-sm text-[var(--color-text)]">
                  <tr>
                    <th>สินค้า</th>
                    <th>หมวดหมู่</th>
                    <th>ราคา</th>
                    <th>สถานะขาย</th>
                    <th>แท็ก</th>
                    <th>สต็อก (รวม)</th>
                    <th>สต็อก (เฉดสี)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const status = p.status ?? "published";
                    const tags = p.tags ?? (p.isPremium ? ["Premium"] : []);
                    return (
                      <tr
                        key={p.id}
                        className="bg-white/80 backdrop-blur-xl rounded-[var(--radius-lg)]"
                      >
                        <td className="rounded-l-[var(--radius-lg)] p-4 font-bold">
                          <div className="min-w-0">
                            <div className="truncate">{p.name}</div>
                            <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                              {p.shade}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{p.category}</td>
                        <td className="p-4">
                          <input
                            className="input h-11 w-28 px-4 text-sm"
                            defaultValue={p.price}
                            id={`price-${p.id}`}
                            min="0"
                            type="number"
                            onBlur={() => {
                              const input = document.getElementById(
                                `price-${p.id}`,
                              ) as HTMLInputElement | null;
                              const next = Math.max(
                                0,
                                Math.floor(Number(input?.value ?? p.price)),
                              );
                              if (next !== p.price)
                                onUpdateProduct(p.id, { price: next });
                            }}
                          />
                        </td>
                        <td className="p-4">
                          <select
                            className="input h-11 px-4 text-sm"
                            value={status}
                            onChange={(e) =>
                              onUpdateProduct(p.id, {
                                status: e.target.value as Product["status"],
                              })
                            }
                          >
                            <option value="published">published</option>
                            <option value="draft">draft</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2 text-xs font-bold">
                            {(["Premium", "New", "Best Seller"] as const).map(
                              (t) => {
                                const active = tags.includes(t);
                                return (
                                  <button
                                    key={t}
                                    className={`rounded-full px-3 py-2 border ${
                                      active
                                        ? "bg-[var(--color-primary)] text-white border-transparent"
                                        : "bg-white/70 text-[var(--color-text)] border-[var(--color-border)]"
                                    }`}
                                    onClick={() => {
                                      const next = active
                                        ? tags.filter((x) => x !== t)
                                        : [...tags, t];
                                      onUpdateProduct(p.id, {
                                        tags: next,
                                        isPremium:
                                          t === "Premium"
                                            ? !active
                                            : p.isPremium,
                                      });
                                    }}
                                  >
                                    {t}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-[var(--color-primary)]">
                            {p.stock}
                          </span>
                        </td>
                        <td className="rounded-r-[var(--radius-lg)] p-4">
                          <div className="space-y-2">
                            {p.colors.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="h-3 w-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                  <span className="truncate text-sm text-[var(--color-text)]">
                                    {c.name}
                                  </span>
                                </div>
                                <input
                                  className="input h-10 w-24 px-3 text-sm"
                                  defaultValue={c.stock}
                                  id={`color-stock-${p.id}-${c.id}`}
                                  min="0"
                                  type="number"
                                  onBlur={() => {
                                    const input = document.getElementById(
                                      `color-stock-${p.id}-${c.id}`,
                                    ) as HTMLInputElement | null;
                                    const next = Math.max(
                                      0,
                                      Math.floor(
                                        Number(input?.value ?? c.stock),
                                      ),
                                    );
                                    if (next !== c.stock) {
                                      onUpdateColorStock(p.id, c.id, next);
                                    }
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "customers" && (
          <section className="glass-xl p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-display text-[var(--color-text)]">
                  Customers / CRM
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  สรุปลูกค้าจากออเดอร์ (จำนวนคำสั่งซื้อ / ยอดใช้จ่าย)
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-4 py-2 text-sm font-bold text-[var(--color-primary)]">
                {customers.length} ลูกค้า
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[860px] border-separate border-spacing-y-3 text-left">
                <thead className="text-sm text-[var(--color-text)]">
                  <tr>
                    <th>ลูกค้า</th>
                    <th>จำนวนออเดอร์</th>
                    <th>ยอดใช้จ่ายรวม</th>
                    <th>ออเดอร์ล่าสุด</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-white/70 p-6 rounded-[var(--radius-xl)] text-sm text-[var(--color-text-secondary)]"
                      >
                        ยังไม่มีข้อมูลลูกค้า (ต้องมีออเดอร์ก่อน)
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr
                        key={c.name}
                        className="bg-white/80 backdrop-blur-xl rounded-[var(--radius-lg)]"
                      >
                        <td className="rounded-l-[var(--radius-lg)] p-4 font-bold">
                          {c.name}
                        </td>
                        <td className="p-4">{c.orderCount}</td>
                        <td className="p-4 font-black text-[var(--color-primary)]">
                          {formatMoney(c.spent)}
                        </td>
                        <td className="rounded-r-[var(--radius-lg)] p-4 text-sm text-[var(--color-text-secondary)]">
                          {c.lastOrderAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "reviews" && (
          <section className="glass-xl p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-display text-[var(--color-text)]">
                  Reviews & Content
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  อนุมัติ/ซ่อน/ลบรีวิว
                </p>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <select
                  className="input h-11 px-4 text-sm"
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="approved">อนุมัติ</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="hidden">ซ่อน</option>
                </select>
                <input
                  className="input h-11 w-full md:w-72 px-4 text-sm"
                  placeholder="ค้นหาชื่อผู้รีวิว/ข้อความ..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-6 text-sm text-[var(--color-text-secondary)]">
                  ไม่มีรีวิวตามเงื่อนไขที่เลือก
                </div>
              ) : (
                filteredReviews.map((r) => {
                  const status = r.status ?? "approved";
                  const product = products.find((p) => p.id === r.productId);
                  return (
                    <div
                      key={r.id}
                      className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-6"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-[var(--color-text)]">
                              {r.userName}
                            </p>
                            <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                              {r.createdAt}
                            </span>
                            <span className="rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                              {status === "approved"
                                ? "อนุมัติ"
                                : status === "pending"
                                  ? "รออนุมัติ"
                                  : "ซ่อน"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            {product?.name ?? "สินค้า"} · {r.rating}/5
                            {r.skinTone ? ` · ${r.skinTone}` : ""}
                          </p>
                          <p className="mt-3 text-[var(--color-text)]">
                            {r.comment}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="btn btn-secondary h-10 px-4"
                            onClick={() =>
                              onUpdateReview(r.id, { status: "approved" })
                            }
                          >
                            อนุมัติ
                          </button>
                          <button
                            className="btn btn-secondary h-10 px-4"
                            onClick={() =>
                              onUpdateReview(r.id, { status: "hidden" })
                            }
                          >
                            ซ่อน
                          </button>
                          <button
                            className="btn bg-[var(--color-danger)] text-white hover:opacity-90 h-10 px-4"
                            onClick={() => onDeleteReview(r.id)}
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {tab === "reports" && (
          <section className="glass-xl p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-display text-[var(--color-text)]">
                  Reports
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  ยอดขายตามวัน + Top 5 สินค้าทำรายได้ (MVP)
                </p>
              </div>
              <button
                className="btn btn-secondary h-11 px-5"
                onClick={exportOrdersCsv}
              >
                Export Orders CSV
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/80 p-6">
                <p className="text-sm font-bold text-[var(--color-text)]">
                  ยอดขายตามวัน
                </p>
                <div className="mt-4 space-y-2">
                  {salesByDay.length === 0 ? (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      ยังไม่มีข้อมูลยอดขาย
                    </div>
                  ) : (
                    (() => {
                      const max = Math.max(
                        ...salesByDay.map((x) => x.total),
                        1,
                      );
                      return salesByDay.slice(-14).map((d) => {
                        const width = Math.max(
                          6,
                          Math.round((d.total / max) * 100),
                        );
                        return (
                          <div key={d.date} className="flex items-center gap-3">
                            <div className="w-28 text-xs font-bold text-[var(--color-text-secondary)]">
                              {d.date}
                            </div>
                            <div className="flex-1">
                              <div className="h-3 rounded-full bg-[var(--color-primary-50)] overflow-hidden">
                                <div
                                  className="h-3 rounded-full bg-[var(--color-primary)]"
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-28 text-right text-xs font-bold text-[var(--color-text)]">
                              {formatMoney(d.total)}
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>

              <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/80 p-6">
                <p className="text-sm font-bold text-[var(--color-text)]">
                  Top 5 สินค้าขายดี (รายได้)
                </p>
                <div className="mt-4 space-y-3">
                  {topProducts.length === 0 ? (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      ยังไม่มีข้อมูล
                    </div>
                  ) : (
                    topProducts.map((p) => (
                      <div
                        key={p.name}
                        className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate font-bold text-[var(--color-text)]">
                              {p.name}
                            </div>
                            <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                              จำนวน {p.qty}
                            </div>
                          </div>
                          <div className="font-black text-[var(--color-primary)]">
                            {formatMoney(p.total)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "settings" && (
          <section className="glass-xl p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-display text-[var(--color-text)]">
                  Settings
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  ค่าจัดส่ง · เกณฑ์ส่งฟรี · วิธีชำระเงิน · เกณฑ์แจ้งเตือนสต็อก
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/80 p-6">
                <p className="text-sm font-bold text-[var(--color-text)]">
                  Shipping
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      เกณฑ์ส่งฟรี (บาท)
                    </span>
                    <input
                      className="input mt-3 w-full text-sm text-[var(--color-text)]"
                      type="number"
                      min="0"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        onUpdateSettings({
                          freeShippingThreshold: Math.max(
                            0,
                            Math.floor(Number(e.target.value)),
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      ค่าส่ง (บาท)
                    </span>
                    <input
                      className="input mt-3 w-full text-sm text-[var(--color-text)]"
                      type="number"
                      min="0"
                      value={settings.shippingFee}
                      onChange={(e) =>
                        onUpdateSettings({
                          shippingFee: Math.max(
                            0,
                            Math.floor(Number(e.target.value)),
                          ),
                        })
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/80 p-6">
                <p className="text-sm font-bold text-[var(--color-text)]">
                  Inventory Alert
                </p>
                <label className="mt-4 block">
                  <span className="text-sm font-bold text-[var(--color-text)]">
                    Low stock threshold
                  </span>
                  <input
                    className="input mt-3 w-full text-sm text-[var(--color-text)]"
                    type="number"
                    min="0"
                    value={settings.lowStockThreshold}
                    onChange={(e) =>
                      onUpdateSettings({
                        lowStockThreshold: Math.max(
                          0,
                          Math.floor(Number(e.target.value)),
                        ),
                      })
                    }
                  />
                </label>
              </div>

              <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/80 p-6 lg:col-span-2">
                <p className="text-sm font-bold text-[var(--color-text)]">
                  Payment Methods
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {paymentMethods.map((m) => {
                    const enabled = settings.enabledPaymentMethods.includes(
                      m as any,
                    );
                    return (
                      <button
                        key={m}
                        className={`rounded-[var(--radius-xl)] border p-5 text-left transition ${
                          enabled
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-50)]"
                            : "border-[var(--color-border)] bg-white/70 hover:bg-white/85"
                        }`}
                        onClick={() => {
                          const next = enabled
                            ? settings.enabledPaymentMethods.filter(
                                (x) => x !== m,
                              )
                            : [...settings.enabledPaymentMethods, m as any];
                          onUpdateSettings({
                            enabledPaymentMethods: next as any,
                          });
                        }}
                      >
                        <p className="text-sm font-bold text-[var(--color-text)]">
                          {m}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          {enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "inventory" && (
          <section className="glass-xl p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-display text-[var(--color-text)]">
                  Inventory
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  ค้นหาและแก้ไขสต็อกสินค้าแบบรวดเร็ว
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                  />
                  แสดงเฉพาะใกล้หมด
                </label>
                <input
                  className="input h-11 w-full sm:w-72 px-4 text-sm"
                  placeholder="ค้นหาชื่อสินค้า/หมวด/เฉดสี..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left">
                <thead className="text-sm text-[var(--color-text)]">
                  <tr>
                    <th>สินค้า</th>
                    <th>หมวดหมู่</th>
                    <th>ราคา</th>
                    <th>สต็อก</th>
                    <th>สถานะ</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((product) => (
                    <tr
                      key={product.id}
                      className="bg-white/80 backdrop-blur-xl rounded-[var(--radius-lg)]"
                    >
                      <td className="rounded-l-[var(--radius-lg)] p-4 font-bold">
                        {product.name}
                      </td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4">฿{product.price}</td>
                      <td className="p-4">
                        <input
                          className="input h-11 w-28 px-4 text-sm"
                          defaultValue={product.stock}
                          id={`stock-${product.id}`}
                          min="0"
                          type="number"
                        />
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-4 py-1 text-xs font-bold ${
                            product.stock <= settings.lowStockThreshold
                              ? "bg-[var(--color-danger)] text-white"
                              : "bg-[var(--color-primary-50)] text-[var(--color-primary)]"
                          }`}
                        >
                          {product.stock <= settings.lowStockThreshold
                            ? "Low Stock"
                            : "Ready"}
                        </span>
                      </td>
                      <td className="rounded-r-[var(--radius-lg)] p-4">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            const input = document.getElementById(
                              `stock-${product.id}`,
                            ) as HTMLInputElement | null;
                            onUpdateStock(
                              product,
                              Number(input?.value ?? product.stock),
                            );
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

            <div className="mt-8">
              <h3 className="text-xl font-display text-[var(--color-text)]">
                ประวัติการเคลื่อนไหวสต็อก
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[860px] border-separate border-spacing-y-3 text-left">
                  <thead className="text-sm text-[var(--color-text)]">
                    <tr>
                      <th>เวลา</th>
                      <th>สินค้า</th>
                      <th>เฉดสี</th>
                      <th>เปลี่ยนแปลง</th>
                      <th>สาเหตุ</th>
                      <th>ผู้ทำรายการ</th>
                      <th>หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="bg-white/70 p-6 rounded-[var(--radius-xl)] text-sm text-[var(--color-text-secondary)]"
                        >
                          ยังไม่มีประวัติการเคลื่อนไหวสต็อก
                        </td>
                      </tr>
                    ) : (
                      stockMovements.slice(0, 25).map((m) => (
                        <tr
                          key={m.id}
                          className="bg-white/80 backdrop-blur-xl rounded-[var(--radius-lg)]"
                        >
                          <td className="rounded-l-[var(--radius-lg)] p-4 text-sm text-[var(--color-text-secondary)]">
                            {m.createdAt}
                          </td>
                          <td className="p-4 font-bold">{m.productName}</td>
                          <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                            {m.colorName ?? "-"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`font-black ${
                                m.delta < 0
                                  ? "text-[var(--color-danger)]"
                                  : "text-[var(--color-primary)]"
                              }`}
                            >
                              {m.delta > 0 ? `+${m.delta}` : String(m.delta)}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                            {m.reason === "order_checkout"
                              ? "ตัดสต็อกจากออเดอร์"
                              : "ปรับสต็อก"}
                          </td>
                          <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                            {m.actor}
                          </td>
                          <td className="rounded-r-[var(--radius-lg)] p-4 text-sm text-[var(--color-text-secondary)]">
                            {m.note ?? "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="glass-xl p-8 min-w-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-display text-[var(--color-text)]">
                    Orders
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    จัดการสถานะออเดอร์และตรวจสอบรายละเอียด
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
                  <select
                    className="input h-11 px-4 text-sm"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as any)}
                  >
                    <option value="all">ทุกสถานะ</option>
                    <option value="waiting_payment">รอชำระ</option>
                    <option value="paid">ชำระแล้ว</option>
                    <option value="cod">ปลายทาง</option>
                    <option value="processing">กำลังเตรียมของ</option>
                    <option value="shipped">จัดส่งแล้ว</option>
                    <option value="completed">สำเร็จ</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                  <input
                    className="input h-11 w-full md:w-72 px-4 text-sm"
                    placeholder="ค้นหาเลขออเดอร์/ชื่อลูกค้า/เลขพัสดุ..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                  <button
                    className="btn btn-secondary h-11 px-5"
                    onClick={exportOrdersCsv}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[860px] border-separate border-spacing-y-3 text-left">
                  <thead className="text-sm text-[var(--color-text)]">
                    <tr>
                      <th>ออเดอร์</th>
                      <th>ลูกค้า</th>
                      <th>ชำระเงิน</th>
                      <th>ยอดรวม</th>
                      <th>สถานะ</th>
                      <th>ปรับสถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr
                        key={o.id}
                        className={`bg-white/80 backdrop-blur-xl rounded-[var(--radius-lg)] ${
                          o.id === selectedOrderId
                            ? "ring-2 ring-[var(--color-primary)]"
                            : ""
                        }`}
                        onClick={() => setSelectedOrderId(o.id)}
                      >
                        <td className="rounded-l-[var(--radius-lg)] p-4 font-bold">
                          {o.id}
                          <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            {o.createdAt}
                          </div>
                        </td>
                        <td className="p-4">{o.customerName}</td>
                        <td className="p-4">{o.paymentMethod}</td>
                        <td className="p-4 font-black text-[var(--color-primary)]">
                          ฿{o.total}
                        </td>
                        <td className="p-4">
                          <span className="rounded-full bg-[var(--color-primary-50)] px-4 py-2 text-xs font-bold text-[var(--color-primary)]">
                            {formatOrderStatus(o.status)}
                          </span>
                        </td>
                        <td className="rounded-r-[var(--radius-lg)] p-4">
                          <select
                            className="input h-11 px-4 text-sm"
                            value={o.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(
                                o.id,
                                e.target.value as Order["status"],
                              )
                            }
                          >
                            <option value="waiting_payment">
                              waiting_payment
                            </option>
                            <option value="paid">paid</option>
                            <option value="cod">cod</option>
                            <option value="processing">processing</option>
                            <option value="shipped">shipped</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="glass-xl p-8 sticky top-24 self-start">
              <h3 className="text-2xl font-display text-[var(--color-text)]">
                รายละเอียดออเดอร์
              </h3>
              {!selectedOrder ? (
                <div className="mt-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 text-sm text-[var(--color-text-secondary)]">
                  เลือกออเดอร์จากตารางเพื่อดูรายละเอียด
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      {selectedOrder.id}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {selectedOrder.customerName} · {selectedOrder.createdAt}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      {selectedOrder.paymentMethod}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="btn btn-secondary h-10 px-4"
                        onClick={() => printOrder(selectedOrder, "shipping")}
                      >
                        พิมพ์ใบจัดส่ง
                      </button>
                      <button
                        className="btn btn-secondary h-10 px-4"
                        onClick={() => printOrder(selectedOrder, "receipt")}
                      >
                        พิมพ์ใบเสร็จ
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      จัดส่ง
                    </p>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[var(--color-text-secondary)]">
                          เลขพัสดุ
                        </span>
                        <input
                          className="input h-10 w-56 px-4 text-sm"
                          value={selectedOrder.trackingNumber ?? ""}
                          onChange={(e) =>
                            onUpdateOrder(selectedOrder.id, {
                              trackingNumber: e.target.value,
                            })
                          }
                          placeholder="TH1234567890"
                        />
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/60 p-4">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                          ที่อยู่จัดส่ง
                        </div>
                        <div className="mt-2 font-bold text-[var(--color-text)]">
                          {selectedOrder.shippingName}
                        </div>
                        <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {selectedOrder.shippingPhone}
                        </div>
                        <div className="mt-2 text-sm text-[var(--color-text)] whitespace-pre-wrap">
                          {selectedOrder.shippingAddress}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      รายการสินค้า
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      {selectedOrder.items.map((it) => (
                        <div
                          key={`${it.productId}-${it.colorId}`}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-[var(--color-text-secondary)]">
                            {it.name} x{it.quantity}
                          </span>
                          <span className="font-bold text-[var(--color-text)]">
                            ฿{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-[var(--color-border)] pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">
                          สินค้า
                        </span>
                        <span className="font-bold">
                          ฿{selectedOrder.subtotal}
                        </span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">
                            ส่วนลด
                          </span>
                          <span className="font-bold text-[var(--color-danger)]">
                            -฿{selectedOrder.discount}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">
                          ค่าจัดส่ง
                        </span>
                        <span className="font-bold">
                          {selectedOrder.shippingFee === 0
                            ? "ฟรี"
                            : `฿${selectedOrder.shippingFee}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-black">
                        <span>รวม</span>
                        <span className="text-[var(--color-primary)]">
                          ฿{selectedOrder.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </section>
        )}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <section className="rounded-[28px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.36))] p-5 backdrop-blur-2xl shadow-[0_18px_55px_rgba(120,80,90,0.10)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
                  Focus Queue
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[20px] border border-white/60 bg-white/65 p-4">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      ออเดอร์ต้องจัดการ
                    </p>
                    <p className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      {processingOrders}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-white/60 bg-white/65 p-4">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      รีวิวรออนุมัติ
                    </p>
                    <p className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      {pendingReviews}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-white/60 bg-white/65 p-4">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      สินค้าใกล้หมด
                    </p>
                    <p className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      {lowStock}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/65 bg-[linear-gradient(180deg,rgba(183,110,121,0.16),rgba(255,255,255,0.48))] p-5 backdrop-blur-2xl shadow-[0_18px_55px_rgba(120,80,90,0.10)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
                  System Mood
                </p>
                <p className="mt-3 text-lg font-bold text-[var(--color-text)]">
                  Luxury commerce, premium fulfillment, soft-glass control.
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  ใช้ visual hierarchy แบบ Apple + Linear แต่ยังรักษางานหลังบ้านให้จัดการได้เร็ว
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function TextInput({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-[var(--color-text)]">
        {label}
      </span>
      <input
        className="input mt-3 w-full text-sm text-[var(--color-text)]"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PhoneInput({
  label,
  country,
  number,
  onChangeCountry,
  onChangeNumber,
}: {
  label: string;
  country: string;
  number: string;
  onChangeCountry: (country: string) => void;
  onChangeNumber: (number: string) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-[var(--color-text)]">
        {label}
      </span>
      <div className="relative mt-3">
        <div className="absolute inset-y-0 left-4 flex items-center gap-2 border-r border-[var(--color-border)] pr-3 text-sm font-bold text-[var(--color-text)]">
          <select
            className="bg-transparent outline-none"
            value={country}
            onChange={(event) => onChangeCountry(event.target.value)}
          >
            <option value="TH">TH</option>
            <option value="US">US</option>
            <option value="ES">ES</option>
            <option value="MR">MR</option>
          </select>
        </div>
        <input
          type="tel"
          placeholder="+66 8X XXX XXXX"
          className="input w-full pl-[5.5rem] text-sm text-[var(--color-text)]"
          value={number}
          onChange={(event) => onChangeNumber(event.target.value)}
        />
      </div>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function BottomNav({
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
              {item.count > 0 && (
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

function BeautyStudio() {
  const [makeup, setMakeup] = useState({
    lipstick: "#D96483",
    blush: "#E8B4B8",
    highlighter: "#D7B9AE",
    foundation: "#E3C8BC",
  });

  const makeupOptions = [
    {
      name: "Lipstick",
      key: "lipstick" as const,
      colors: ["#D96483", "#E2583E", "#7A283D", "#B84A6C"],
    },
    {
      name: "Blush",
      key: "blush" as const,
      colors: ["#E8B4B8", "#F2A284", "#D88C9A"],
    },
    {
      name: "Highlighter",
      key: "highlighter" as const,
      colors: ["#D7B9AE", "#E2A49A", "#F1D2C5"],
    },
    {
      name: "Foundation",
      key: "foundation" as const,
      colors: ["#F5E1D3", "#E3C8BC", "#CEB2A6"],
    },
  ];

  return (
    <section className="glass-xl p-8">
      <h2 className="text-3xl font-display text-[var(--color-primary)] mb-8">
        💄 LUXEA Beauty Studio
      </h2>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: Preview */}
        <div className="bg-white rounded-[var(--radius-2xl)] p-8 flex items-center justify-center">
          <div className="relative w-full max-w-md h-80 bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-accent-100)] rounded-[var(--radius-2xl)] flex items-center justify-center">
            <span className="text-9xl">💄</span>
          </div>
        </div>
        {/* Right: Controls */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[var(--color-text)]">
            เลือกสีเครื่องสำอาง
          </h3>
          {makeupOptions.map((option) => (
            <div key={option.name} className="glass p-5">
              <h4 className="font-bold mb-3 text-[var(--color-primary)]">
                {option.name}
              </h4>
              <div className="flex gap-3 flex-wrap">
                {option.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setMakeup((prev) => ({ ...prev, [option.key]: color }))
                    }
                    className={`color-dot ${makeup[option.key] === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-3">
            <button className="btn btn-primary w-full">Save This Look</button>
            <button className="btn btn-secondary w-full">Buy The Look</button>
          </div>
        </div>
      </div>
    </section>
  );
}
