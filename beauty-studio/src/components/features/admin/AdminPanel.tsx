/*
==================================================
ไฟล์: components/features/admin/AdminPanel.tsx

หน้าที่:
หน้าจัดการระบบหลังบ้าน (Admin Panel)

ใช้สำหรับ:
- หน้า Admin
- จัดการสินค้า, สต็อก, ออเดอร์, รีวิว, รายงาน, การตั้งค่า

ทำงานร่วมกับ:
- BeautyShopApp
- Product, Order, Review, StockMovement, StoreSettings Types
- Utils (formatMoney, formatOrderStatus, escapeHtml, downloadTextFile)

หมายเหตุ:
มีระบบ Tab แยกตามฟังก์ชันการทำงาน
==================================================
*/

"use client";

import { useState, useMemo } from "react";
import { Product, Order, Review, StockMovement, StoreSettings } from "@/src/types";
import { ADMIN_TABS, AdminTabId } from "@/src/constants";
import { formatMoney, formatOrderStatus, escapeHtml, downloadTextFile } from "@/src/utils";

/**
 * หน้า Admin หลัก
 *
 * จุดประสงค์: จัดการระบบหลังบ้านทั้งหมด
 * Input: products, orders, reviews, stockMovements, settings, total, setView,
 *        onUpdateStock, onUpdateColorStock, onUpdateOrderStatus, onUpdateOrder,
 *        onUpdateProduct, onUpdateReview, onDeleteReview, onUpdateSettings
 * Output: JSX Element
 */
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
  onUpdateColorStock: (productId: string, colorId: string, nextStock: number) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: Order["status"]) => void;
  onUpdateOrder: (orderId: string, patch: Partial<Order>) => void;
  onUpdateProduct: (productId: string, patch: Partial<Product>) => void;
  onUpdateReview: (reviewId: string, patch: Partial<Review>) => void;
  onDeleteReview: (reviewId: string) => void;
  onUpdateSettings: (patch: Partial<StoreSettings>) => void;
}) {
  const [tab, setTab] = useState<AdminTabId>("dashboard");
  const [inventorySearch, setInventorySearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<"all" | Order["status"]>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"all" | NonNullable<Review["status"]>>("all");

  const lowStock = products.filter(
    (product) => product.stock <= settings.lowStockThreshold,
  ).length;

  const filteredInventory = useMemo(() => {
    const keyword = inventorySearch.toLowerCase().trim();
    return products.filter((p) => {
      const matchedKeyword = !keyword || `${p.name} ${p.category} ${p.shade}`.toLowerCase().includes(keyword);
      const matchedStock = !lowStockOnly || p.stock <= settings.lowStockThreshold;
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
          .toLowerCase().includes(keyword);
      });
  }, [orderSearch, orderStatus, orders]);

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.toLowerCase().trim();
    if (!keyword) return products;
    return products.filter((p) => `${p.name} ${p.category} ${p.shade}`.toLowerCase().includes(keyword));
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

  const selectedOrder = selectedOrderId ? orders.find((o) => o.id === selectedOrderId) : null;

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; orderCount: number; spent: number; lastOrderAt: string }>();
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const current = map.get(o.customerName);
      if (!current) {
        map.set(o.customerName, { name: o.customerName, orderCount: 1, spent: o.total, lastOrderAt: o.createdAt });
        return;
      }
      map.set(o.customerName, { name: o.customerName, orderCount: current.orderCount + 1, spent: current.spent + o.total, lastOrderAt: current.lastOrderAt });
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
          map.set(it.productId, { name: it.name, qty: it.quantity, total: addTotal });
          return;
        }
        map.set(it.productId, { name: current.name, qty: current.qty + it.quantity, total: current.total + addTotal });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [orders]);

  const activeTabMeta = ADMIN_TABS.find((item) => item.id === tab) ?? ADMIN_TABS[0];
  const paidOrders = orders.filter((o) => ["paid", "processing", "shipped", "completed", "cod"].includes(o.status));
  const processingOrders = orders.filter((o) => ["waiting_payment", "paid", "processing", "cod"].includes(o.status)).length;
  const pendingReviews = reviews.filter((r) => (r.status ?? "approved") === "pending").length;
  const conversionValue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  function exportOrdersCsv() {
    const header = ["order_id", "created_at", "customer_name", "status", "payment_method", "shipping_name", "shipping_phone", "shipping_address", "tracking_number", "subtotal", "discount", "shipping_fee", "total", "coupon_code", "items"];
    const lines = filteredOrders.map((o) => {
      const items = o.items.map((it) => `${it.name} x${it.quantity} (${it.price})`).join(" | ");
      const row = [o.id, o.createdAt, o.customerName, o.status, o.paymentMethod, o.shippingName, o.shippingPhone, o.shippingAddress, o.trackingNumber ?? "", String(o.subtotal), String(o.discount), String(o.shippingFee), String(o.total), o.couponCode ?? "", items].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      return row.join(",");
    });
    downloadTextFile(`luxea-orders-${new Date().toISOString().slice(0, 10)}.csv`, [header.join(","), ...lines].join("\n"), "text/csv;charset=utf-8");
  }

  function printOrder(order: Order, kind: "receipt" | "shipping") {
    const title = kind === "receipt" ? "ใบเสร็จรับเงิน" : "ใบจัดส่ง";
    const itemsHtml = order.items.map((it) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(it.name)}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${it.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(it.price * it.quantity))}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(title)} ${escapeHtml(order.id)}</title></head><body style="font-family: sans-serif;padding:24px;max-width:780px;margin:0 auto;"><h1>${escapeHtml(title)}</h1><p>ออเดอร์: ${escapeHtml(order.id)}</p><table>${itemsHtml}</table><script>window.print();</script></body></html>`;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,253,252,0.86))] p-4 md:p-5 shadow-[0_28px_120px_rgba(120,80,90,0.16)]">
      <div className="relative grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.26))] p-5 backdrop-blur-2xl xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(183,110,121,0.82),rgba(164,93,104,0.92))] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">LUXEA OS</p>
                <h2 className="mt-2 font-display text-3xl leading-none">Control Suite</h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/12 text-lg backdrop-blur-xl">{"\u2726"}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/14 bg-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Revenue</p>
                <p className="mt-2 text-xl font-black">{formatMoney(conversionValue)}</p>
              </div>
              <div className="rounded-[22px] border border-white/14 bg-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Queue</p>
                <p className="mt-2 text-xl font-black">{processingOrders}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-[28px] border border-white/60 bg-white/40 p-3 backdrop-blur-2xl">
            <div className="grid gap-2">
              {ADMIN_TABS.map((item) => {
                const active = tab === item.id;
                return (
                  <button key={item.id} onClick={() => setTab(item.id)}
                    className={`group w-full rounded-[22px] px-4 py-4 text-left transition-all ${active ? "bg-[linear-gradient(180deg,rgba(183,110,121,0.18),rgba(183,110,121,0.08))]" : "hover:bg-white/55"}`}>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-black ${active ? "border-[rgba(183,110,121,0.24)] bg-[var(--color-primary)] text-white" : "border-white/60 bg-white/65 text-[var(--color-text-secondary)]"}`}>{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">{item.eyebrow}</p>
                        <p className="mt-1 truncate text-sm font-bold text-[var(--color-text)]">{item.label}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <button className="btn btn-primary w-full" onClick={() => setView("home")}>กลับหน้าร้าน</button>
            <button className="btn btn-secondary w-full" onClick={() => setView("account")}>ไปหน้าบัญชี</button>
          </div>
        </aside>

        <div className="space-y-6 min-w-0">{/* Main content area */}
          <section className="relative overflow-hidden rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.34))] p-6 md:p-7 backdrop-blur-2xl">
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--color-text-secondary)]">{activeTabMeta.eyebrow}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/70 text-xl text-[var(--color-primary)] shadow-sm">{activeTabMeta.icon}</span>
                  <div className="min-w-0">
                    <h2 className="font-display text-4xl leading-none text-[var(--color-text)]">{activeTabMeta.label}</h2>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Products</p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-text)]">{products.length}</p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Alerts</p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-text)]">{lowStock + pendingReviews}</p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Orders</p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-text)]">{orders.length}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="min-w-0">
            {/* Dashboard Tab */}
            {tab === "dashboard" && (
              <div className="glass p-6">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Dashboard</h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">ภาพรวมระบบ</p>
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard label="สินค้าทั้งหมด" value={String(products.length)} />
                  <StatCard label="ออเดอร์" value={String(orders.length)} />
                  <StatCard label="Cart Value" value={`฿${total}`} />
                  <StatCard label="สินค้าใกล้หมด" value={String(lowStock)} />
                </div>
              </div>
            )}

            {/* Products Tab */}
            {tab === "products" && (
              <div className="glass-xl p-8">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Product Management</h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">แก้ไขสินค้า {"\u00B7"} สถานะ {"\u00B7"} แท็ก</p>
                <input className="input h-11 w-full md:w-80 px-4 text-sm mt-4" placeholder="ค้นหาสินค้า..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
              </div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <div className="glass-xl p-8">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Orders</h2>
                <div className="mt-4 flex gap-3">
                  <select className="input h-11 px-4 text-sm" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as any)}>
                    <option value="all">ทุกสถานะ</option>
                    <option value="waiting_payment">รอชำระ</option>
                    <option value="paid">ชำระแล้ว</option>
                    <option value="cod">ปลายทาง</option>
                    <option value="processing">กำลังเตรียมของ</option>
                    <option value="shipped">จัดส่งแล้ว</option>
                    <option value="completed">สำเร็จ</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                  <input className="input h-11 flex-1 px-4 text-sm" placeholder="ค้นหาออเดอร์..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
                  <button className="btn btn-secondary h-11 px-5" onClick={exportOrdersCsv}>Export CSV</button>
                </div>
                <div className="mt-6 space-y-3">
                  {filteredOrders.map((o) => (
                    <div key={o.id} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5 cursor-pointer" onClick={() => setSelectedOrderId(o.id)}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">{o.id}</p>
                          <p className="text-sm text-[var(--color-text-secondary)]">{o.customerName} {"\u00B7"} {o.createdAt}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{formatOrderStatus(o.status)}</span>
                          <p className="text-lg font-black text-[var(--color-primary)]">{formatMoney(o.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {tab === "inventory" && (
              <div className="glass-xl p-8">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Inventory</h2>
                <div className="mt-4 flex gap-3">
                  <input className="input h-11 flex-1 px-4 text-sm" placeholder="ค้นหา..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} />
                  <label className="inline-flex items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
                    แสดงเฉพาะใกล้หมด
                  </label>
                </div>
                <div className="mt-6 space-y-3">
                  {filteredInventory.map((p) => (
                    <div key={p.id} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{p.category} {"\u00B7"} ฿{p.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input className="input h-10 w-28 px-3 text-sm" id={`stock-${p.id}`} defaultValue={p.stock} min="0" type="number" />
                        <button className="btn btn-primary" onClick={() => { const input = document.getElementById(`stock-${p.id}`) as HTMLInputElement; onUpdateStock(p, Number(input?.value ?? p.stock)); }}>Save</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simplified tabs for remaining */}
            {tab === "reviews" && (
              <div className="glass-xl p-8">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Reviews</h2>
                <div className="mt-4 space-y-3">
                  {filteredReviews.map((r) => (
                    <div key={r.id} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5">
                      <p className="font-bold">{r.userName}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "reports" && (
              <div className="glass-xl p-8">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Reports</h2>
                <button className="btn btn-secondary mt-4" onClick={exportOrdersCsv}>Export Orders CSV</button>
              </div>
            )}

            {tab === "settings" && (
              <div className="glass-xl p-8">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Settings</h2>
              </div>
            )}

            {tab === "customers" && (
              <div className="glass-xl p-8">
                <h2 className="text-3xl font-display text-[var(--color-text)]">Customers</h2>
                <div className="mt-6 space-y-3">
                  {customers.map((c) => (
                    <div key={c.name} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5 flex justify-between">
                      <span className="font-bold">{c.name}</span>
                      <span className="font-black text-[var(--color-primary)]">{formatMoney(c.spent)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass p-6">
      <p className="text-[11px] font-bold uppercase text-[var(--color-primary)]">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}