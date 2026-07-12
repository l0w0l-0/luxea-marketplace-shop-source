"use client";
import { paymentMethods } from "@/src/data/initialData";

import { useMemo, useState } from "react";
import type { Product, Order, Review, StockMovement, StoreSettings } from "@/src/types";
import { formatMoney, formatOrderStatus, downloadTextFile, escapeHtml } from "@/src/utils";
import { Stat } from "@/src/components/common/Stat";

export function AdminPanel({
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

