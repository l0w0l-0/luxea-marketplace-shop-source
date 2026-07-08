/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { Product, Order, Review, StockMovement, StoreSettings } from "../types";
import {
  formatOrderStatus,
  formatMoney,
  downloadTextFile,
  escapeHtml,
} from "../shared/commerce";
import { Stat } from "./Shared";

interface AdminPanelProps {
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
}

/**
 * แผงควบคุมระบบจัดการหลังบ้านระดับพรีเมียม (Admin Panel Dashboard Operations Screen)
 * ประกอบไปด้วยแท็บแยกย่อย 8 แท็บ: สรุปภาพรวมหลังร้าน, แคตตาล็อกสินค้า, คลังคุมสต็อกเฉดสี, จัดการออเดอร์, จัดการข้อมูลลูกค้า, กรองรีวิวข้อความ, รายงานสรุปบัญชี และ การตั้งค่าระบบขนส่ง/การชำระเงิน
 */
export default function AdminPanel({
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
}: AdminPanelProps) {
  
  // แท็บทำงานย่อย
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

  // State ต่าง ๆ สำหรับการค้นหาและฟิลเตอร์ในแต่ละแท็บ
  const [inventorySearch, setInventorySearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<"all" | Order["status"]>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"all" | NonNullable<Review["status"]>>("all");

  // สินค้าคลังใกล้หมด
  const lowStock = products.filter(
    (product) => product.stock <= settings.lowStockThreshold,
  ).length;

  // คัดกรองข้อมูลคลังสต็อก (Inventory Tab Filtering)
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

  // คัดกรองออเดอร์ (Orders Tab Filtering)
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

  // คัดกรองสินค้าหลังบ้าน (Products Tab Filtering)
  const filteredProducts = useMemo(() => {
    const keyword = productSearch.toLowerCase().trim();
    if (!keyword) return products;
    return products.filter((p) =>
      `${p.name} ${p.category} ${p.shade}`.toLowerCase().includes(keyword),
    );
  }, [productSearch, products]);

  // คัดกรองรีวิว (Reviews Tab Filtering)
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

  // ประมวลผลข้อมูลยอดสะสมรวมของลูกค้า (CRM customers list)
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

  // ยอดขายรายวัน (Reports - Daily Sales revenue)
  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const key = o.createdAt.split(" ")[0] ?? o.createdAt;
      map.set(key, (map.get(key) ?? 0) + o.total);
    });
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
  }, [orders]);

  // สินค้าที่ขายดีที่สุด 5 ลำดับแรก (Reports - Top 5 products)
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

  // ลิสต์เมนูนำทางหลังร้าน
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
    { id: "dashboard", label: "ภาพรวมหลังร้าน", eyebrow: "Overview", icon: "◈" },
    { id: "products", label: "จัดการรายการสินค้า", eyebrow: "Catalog", icon: "✦" },
    { id: "inventory", label: "สต็อก/ความเคลื่อนไหว", eyebrow: "Stock", icon: "◌" },
    { id: "orders", label: "คุมคำสั่งซื้อ", eyebrow: "Fulfillment", icon: "→" },
    { id: "customers", label: "ข้อมูลลูกค้า CRM", eyebrow: "CRM", icon: "◎" },
    { id: "reviews", label: "จัดการข้อคิดเห็น", eyebrow: "Content", icon: "✳" },
    { id: "reports", label: "รายงานยอดขาย", eyebrow: "Revenue", icon: "◫" },
    { id: "settings", label: "ตั้งค่าร้านค้า", eyebrow: "System", icon: "⋯" },
  ];

  const activeTabMeta = adminTabs.find((item) => item.id === tab) ?? adminTabs[0];
  const paidOrders = orders.filter((o) =>
    ["paid", "processing", "shipped", "completed", "cod"].includes(o.status),
  );
  const processingOrders = orders.filter((o) =>
    ["waiting_payment", "paid", "processing", "cod"].includes(o.status),
  ).length;
  const pendingReviews = reviews.filter((r) => (r.status ?? "approved") === "pending").length;
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  /**
   * Export ข้อมูลออเดอร์ทั้งหมดออกเป็นไฟล์ Excel/CSV คลาสสิก
   */
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

  /**
   * พิมพ์เอกสารพัสดุหรือใบเสร็จแบบ HTML คลาสสิก (Print Receipts / Shipping Labels)
   */
  function printOrder(order: Order, kind: "receipt" | "shipping") {
    const title = kind === "receipt" ? "ใบเสร็จรับเงินอย่างย่อ" : "ใบจัดส่งพัสดุหน้ากล่อง";
    const itemsHtml = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:bold;">${escapeHtml(it.name)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${it.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(
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
      <body style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a; padding:32px;">
        <div style="max-width:720px;margin:0 auto;border: 1px solid #ddd; padding: 24px; border-radius: 16px; background:#fff;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
            <div>
              <div style="font-size:14px;letter-spacing:.25em;font-weight:900;color:#a35d6a;">✦ LUXEA BEAUTY</div>
              <h1 style="margin:8px 0 0;font-size:24px;">${escapeHtml(title)}</h1>
              <div style="margin-top:8px;color:#475569;font-size:13px;">
                เลขอ้างอิงออเดอร์: <b>${escapeHtml(order.id)}</b> · วันสั่งซื้อ: ${escapeHtml(
                  order.createdAt,
                )}
              </div>
            </div>
            <div style="text-align:right;color:#475569;font-size:13px;">
              สถานะชำระ: <b>${escapeHtml(formatOrderStatus(order.status))}</b><br/>
              ช่องทางจ่าย: <b>${escapeHtml(order.paymentMethod)}</b><br/>
              เลขติดตาม: <b>${escapeHtml(order.trackingNumber ?? "รอดำเนินการ")}</b>
            </div>
          </div>

          <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#64748b;text-transform:uppercase;">ที่อยู่จัดส่งสินค้า</div>
              <div style="margin-top:8px;font-weight:800;font-size:15px;">${escapeHtml(order.shippingName)}</div>
              <div style="margin-top:4px;color:#475569;font-weight:bold;">${escapeHtml(order.shippingPhone)}</div>
              <div style="margin-top:8px;color:#334155;white-space:pre-wrap;font-size:13px;line-height:1.5;">${escapeHtml(
                order.shippingAddress,
              )}</div>
            </div>
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px;background:#fafaf9;">
              <div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#64748b;text-transform:uppercase;">สรุปรายการชำระสุทธิ</div>
              <div style="margin-top:10px;display:flex;justify-content:space-between;color:#475569;font-size:13px;">
                <span>รวมสินค้า</span><b>${escapeHtml(formatMoney(order.subtotal))}</b>
              </div>
              <div style="margin-top:6px;display:flex;justify-content:space-between;color:#475569;font-size:13px;">
                <span>หักส่วนลดคูปอง</span><b style="color:#b91c1c;">-${escapeHtml(
                  formatMoney(order.discount),
                )}</b>
              </div>
              <div style="margin-top:6px;display:flex;justify-content:space-between;color:#475569;font-size:13px;">
                <span>ค่าบริการจัดส่ง</span><b>${escapeHtml(
                  order.shippingFee === 0
                    ? "จัดส่งฟรี"
                    : formatMoney(order.shippingFee),
                )}</b>
              </div>
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:18px;">
                <span style="font-weight:900;">ยอดรวมชำระ</span><span style="font-weight:900;color:#a35d6a;">${escapeHtml(
                  formatMoney(order.total),
                )}</span>
              </div>
            </div>
          </div>

          <div style="margin-top:18px;border:1px solid #e5e7eb;border-radius:14px;padding:16px;">
            <div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#64748b;text-transform:uppercase;border-bottom:1px solid #eee;pb:6px;">รายการสิ่งของพัสดุ</div>
            <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;">
              <thead>
                <tr style="text-align:left;color:#64748b;">
                  <th style="padding:8px 0;">ชื่อสินค้า</th>
                  <th style="padding:8px 0;text-align:right;width:80px;">จำนวน</th>
                  <th style="padding:8px 0;text-align:right;width:120px;">ราคารวม</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="margin-top:24px;text-align:center;color:#94a3b8;font-size:12px;font-weight:bold;">
            - ขอขอบพระคุณทุกการสั่งซื้อพรีเมียมจากคุณลูกค้าคนพิเศษ / พิมพ์โดยระบบหลังบ้าน LUXEA OS -
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
    <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,253,252,0.86))] p-4 md:p-5 shadow-[0_28px_120px_rgba(120,80,90,0.16)] animate-fade-in">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_560px_at_8%_12%,rgba(183,110,121,0.12),transparent_58%),radial-gradient(900px_560px_at_92%_18%,rgba(242,216,201,0.18),transparent_62%),radial-gradient(800px_480px_at_55%_92%,rgba(232,199,204,0.14),transparent_62%)]" />
      
      <div className="relative grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        
        {/* เมนูนำทางด้านซ้ายหลังร้าน */}
        <aside className="rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.26))] p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(120,80,90,0.12)] xl:sticky xl:top-24 xl:self-start">
          
          <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(183,110,121,0.82),rgba(164,93,104,0.92))] p-5 text-white shadow-[0_24px_60px_rgba(183,110,121,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
                  LUXEA OS
                </p>
                <h2 className="mt-2 font-display text-2xl font-black leading-none">
                  Control Suite
                </h2>
                <p className="mt-3 text-xs text-white/78 leading-relaxed">
                  พอร์ทัลระบบจัดการคำสั่งซื้อ สต็อก และความงามหลังบ้านอย่างสมบูรณ์แบบ
                </p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/12 text-base backdrop-blur-xl">
                ✦
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/14 bg-white/10 p-3 text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
                  รายรับสุทธิ
                </p>
                <p className="mt-1 text-sm font-black truncate">
                  {formatMoney(totalRevenue)}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/14 bg-white/10 p-3 text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
                  ออเดอร์ค้าง
                </p>
                <p className="mt-1 text-sm font-black">{processingOrders}</p>
              </div>
            </div>
          </div>

          {/* รายชื่อแท็บ */}
          <div className="mt-4 rounded-[28px] border border-white/60 bg-white/40 p-2 backdrop-blur-2xl">
            <div className="grid gap-1">
              {adminTabs.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`group w-full rounded-[22px] px-3 py-2 text-left transition-all cursor-pointer ${
                      active
                        ? "bg-[linear-gradient(180deg,rgba(183,110,121,0.18),rgba(183,110,121,0.08))] shadow-[0_14px_34px_rgba(120,80,90,0.10)]"
                        : "hover:bg-white/55"
                    }`}
                    onClick={() => setTab(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black shrink-0 ${
                          active
                            ? "border-[rgba(183,110,121,0.24)] bg-[var(--color-primary)] text-white"
                            : "border-white/60 bg-white/65 text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                          {item.eyebrow}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-bold text-[var(--color-text)]">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              className="btn btn-primary w-full text-xs h-10 cursor-pointer font-bold"
              onClick={() => setView("home")}
            >
              กลับหน้าร้านหลัก
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full text-xs h-10 cursor-pointer font-bold"
              onClick={() => setView("account")}
            >
              ดูสิทธิ์ประวัติบัญชี
            </button>
          </div>
        </aside>

        {/* รายละเอียดเนื้อหาในแต่ละแท็บย่อย */}
        <div className="space-y-6 min-w-0">
          
          <section className="relative overflow-hidden rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.34))] p-6 backdrop-blur-2xl shadow-[0_20px_65px_rgba(120,80,90,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_340px_at_10%_0%,rgba(183,110,121,0.12),transparent_60%),radial-gradient(700px_340px_at_92%_12%,rgba(242,216,201,0.16),transparent_62%)]" />
            
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[var(--color-text-secondary)]">
                  {activeTabMeta.eyebrow} Panel
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/70 text-lg text-[var(--color-primary)] shadow-sm">
                    {activeTabMeta.icon}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl md:text-3xl leading-none text-[var(--color-text)] font-black">
                      {activeTabMeta.label}
                    </h2>
                    <p className="mt-2 text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
                      ปรับเปลี่ยนสเปกเครื่องสำอาง ติดตามคิวออเดอร์สินค้าของลูกค้าได้แบบเรียลไทม์
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-3">
                <div className="rounded-[20px] border border-white/70 bg-white/65 p-3 shadow-sm text-center">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Products
                  </p>
                  <p className="mt-1 text-lg font-black text-[var(--color-text)]">
                    {products.length}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/70 bg-white/65 p-3 shadow-sm text-center">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Alerts
                  </p>
                  <p className="mt-1 text-lg font-black text-red-500">
                    {lowStock + pendingReviews}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/70 bg-white/65 p-3 shadow-sm text-center">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Orders
                  </p>
                  <p className="mt-1 text-lg font-black text-[var(--color-text)]">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ตารางสถิติและแบบฟอร์มแก้ไขของแต่ละแท็บย่อย */}
          <div className="grid gap-4">
            
            {/* 1. แท็บภาพรวมระบบแดชบอร์ด */}
            {tab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-4">
                  <Stat label="ยอดสถิติสินค้าพร้อมขาย" value={`${products.length} หมวด`} />
                  <Stat label="ใบสั่งซื้อของลูกค้าทั้งหมด" value={`${orders.length} ออเดอร์`} />
                  <Stat label="ความค้างเตรียมคลัง" value={`${processingOrders} ออเดอร์`} />
                  <Stat label="สต็อกใกล้หมดแจ้งเตือน" value={`${lowStock} รายการ`} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  
                  {/* การแจ้งเตือนสินค้าสต็อกต่ำ */}
                  <div className="glass p-6 border border-[var(--color-border)]">
                    <h3 className="font-display text-lg font-bold text-[var(--color-text)] border-b pb-2 mb-4">
                      🚨 สต็อกใกล้หมด (Low Stock Alerts)
                    </h3>
                    <div className="space-y-2">
                      {products.filter((p) => p.stock <= settings.lowStockThreshold).length === 0 ? (
                        <p className="text-xs text-[var(--color-text-secondary)] py-2 font-bold text-center">คลังยังมีความพร้อมปกติ ไม่มีสถิติต่ำกว่าเกณฑ์ค่ะ</p>
                      ) : (
                        products
                          .filter((p) => p.stock <= settings.lowStockThreshold)
                          .map((p) => (
                            <div key={p.id} className="flex justify-between items-center text-xs p-3 bg-white/60 rounded-xl border border-red-50">
                              <span className="font-bold">{p.name}</span>
                              <span className="text-red-500 font-black">เหลือ {p.stock} ชิ้น</span>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* ลิสต์ออเดอร์ยอดล่าสุด */}
                  <div className="glass p-6 border border-[var(--color-border)]">
                    <h3 className="font-display text-lg font-bold text-[var(--color-text)] border-b pb-2 mb-4">
                      📦 ออเดอร์ล่าสุดเข้าระบบ
                    </h3>
                    <div className="space-y-2">
                      {orders.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-secondary)] py-2 font-bold text-center">ยังไม่มีข้อมูลออเดอร์ในวันนี้</p>
                      ) : (
                        orders.slice(0, 5).map((o) => (
                          <div key={o.id} className="flex justify-between items-center text-xs p-3 bg-white/60 rounded-xl border border-[var(--color-border)] cursor-pointer hover:bg-white transition" onClick={() => { setSelectedOrderId(o.id); setTab("orders"); }}>
                            <div>
                              <p className="font-bold">{o.id}</p>
                              <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">{o.customerName} · {o.createdAt}</p>
                            </div>
                            <span className="font-black text-[var(--color-primary)]">{formatMoney(o.total)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. แท็บจัดการรายการแคตตาล็อก */}
            {tab === "products" && (
              <div className="glass p-6 border border-[var(--color-border)] bg-white/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
                  <h3 className="font-display text-lg font-bold">คลังราคาแคตตาล็อกเครื่องสำอาง</h3>
                  <input
                    className="input h-10 w-full sm:w-64 px-4 text-xs"
                    placeholder="ค้นหาตามคำหลัก..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[720px]">
                    <thead>
                      <tr className="border-b text-[var(--color-text-secondary)] font-bold">
                        <th className="py-2">ไอดีสินค้า</th>
                        <th className="py-2">ชื่อสินค้า</th>
                        <th className="py-2">ราคาจำหน่าย (บาท)</th>
                        <th className="py-2">สิทธิ์เปิดจำหน่าย</th>
                        <th className="py-2">รวมสต็อก</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-white/40">
                          <td className="py-3 font-semibold">{p.id}</td>
                          <td className="py-3 font-bold">{p.name}</td>
                          <td className="py-3">
                            <input
                              className="input h-9 w-24 px-2 text-xs"
                              type="number"
                              defaultValue={p.price}
                              onBlur={(e) => onUpdateProduct(p.id, { price: Math.max(0, parseInt(e.target.value) || 0) })}
                            />
                          </td>
                          <td className="py-3">
                            <select
                              className="input h-9 px-2 text-xs"
                              defaultValue={p.status ?? "published"}
                              onChange={(e) => onUpdateProduct(p.id, { status: e.target.value as any })}
                            >
                              <option value="published">เปิดขายปกติ</option>
                              <option value="draft">ซ่อนแบบร่าง</option>
                            </select>
                          </td>
                          <td className="py-3 font-black text-[var(--color-primary)]">{p.stock} ชิ้น</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. แท็บคลังและประวัติสต็อกเฉดสี */}
            {tab === "inventory" && (
              <div className="glass p-6 border border-[var(--color-border)] bg-white/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
                  <h3 className="font-display text-lg font-bold">สต็อกคลังเฉดสีผลิตภัณฑ์</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold inline-flex items-center gap-1 cursor-pointer mr-2">
                      <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
                      กรองเฉพาะใกล้หมด
                    </label>
                    <input
                      className="input h-10 w-full sm:w-48 px-4 text-xs"
                      placeholder="ค้นหาสินค้าคลัง..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-xs text-left border-collapse min-w-[720px]">
                    <thead>
                      <tr className="border-b text-[var(--color-text-secondary)] font-bold">
                        <th className="py-2">สินค้า</th>
                        <th className="py-2">เฉดสี / สเปก</th>
                        <th className="py-2">สต็อกรายเฉด</th>
                        <th className="py-2 text-right">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-white/40">
                          <td className="py-3 font-bold">{p.name} <span className="block text-[10px] text-[var(--color-text-secondary)] font-medium">หมวด: {p.category}</span></td>
                          <td className="py-3">
                            <div className="space-y-1.5">
                              {p.colors.map((c) => (
                                <div key={c.id} className="flex items-center gap-2 font-bold text-[10px]">
                                  <span className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                                  <span>{c.name} ({c.hex})</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="space-y-1.5">
                              {p.colors.map((c) => (
                                <input
                                  key={c.id}
                                  className="input h-8 w-20 px-2 text-xs block"
                                  type="number"
                                  id={`inv-stock-${p.id}-${c.id}`}
                                  defaultValue={c.stock}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="space-y-1.5 flex flex-col items-end">
                              {p.colors.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  className="btn btn-secondary h-8 px-3 text-[10px] cursor-pointer"
                                  onClick={() => {
                                    const input = document.getElementById(`inv-stock-${p.id}-${c.id}`) as HTMLInputElement | null;
                                    if (input) {
                                      onUpdateColorStock(p.id, c.id, Math.max(0, parseInt(input.value) || 0));
                                    }
                                  }}
                                >
                                  บันทึก {c.name}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* แสดงประวัติความเคลื่อนไหวสต็อกสินค้าล่าสุด */}
                <div className="border-t pt-6">
                  <h3 className="font-display text-base font-bold mb-4">📜 ประวัติความเคลื่อนไหวสต็อก (Stock Movement Audit Logs)</h3>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {stockMovements.length === 0 ? (
                      <p className="text-xs text-[var(--color-text-secondary)] text-center font-bold py-4">ยังไม่พบบันทึกการเปลี่ยนแปลงในวันนี้</p>
                    ) : (
                      stockMovements.map((mov) => (
                        <div key={mov.id} className="p-3 bg-white border rounded-xl text-[11px] font-medium flex justify-between items-center shadow-sm">
                          <div>
                            <span className="text-[var(--color-text-secondary)] font-bold">{mov.createdAt}</span> · <strong className="text-[var(--color-text)]">{mov.productName}</strong> ({mov.colorName ?? "คลังรวม"})
                            <span className="block text-[var(--color-text-secondary)] mt-0.5">เหตุผล: {mov.reason === "order_checkout" ? `หักอัตโนมัติจากออเดอร์ ${mov.note}` : `ผู้ดูแลอัปเดตสต็อกเอง: ${mov.note ?? ""}`}</span>
                          </div>
                          <span className={`font-black text-xs ${mov.delta < 0 ? "text-red-500" : "text-green-600"}`}>
                            {mov.delta > 0 ? `+${mov.delta}` : mov.delta}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. แท็บควบคุมจัดการออเดอร์ */}
            {tab === "orders" && (
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="glass p-6 border border-[var(--color-border)] bg-white/50 min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
                    <h3 className="font-display text-lg font-bold">คิวออเดอร์และพัสดุในร้าน</h3>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        className="input h-10 px-2 text-xs"
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value as any)}
                      >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="waiting_payment">รอจ่ายเงิน</option>
                        <option value="paid">ชำระแล้ว</option>
                        <option value="cod">ปลายทาง</option>
                        <option value="processing">เตรียมจัดของ</option>
                        <option value="shipped">ส่งแล้ว</option>
                        <option value="completed">เสร็จสิ้น</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                      
                      <input
                        className="input h-10 w-full sm:w-40 px-3 text-xs"
                        placeholder="ค้นหาเลขออเดอร์/เบอร์..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse min-w-[640px]">
                      <thead>
                        <tr className="border-b text-[var(--color-text-secondary)] font-bold">
                          <th className="py-2">เลขออเดอร์</th>
                          <th className="py-2">ผู้ซื้อ</th>
                          <th className="py-2">สรุปยอด</th>
                          <th className="py-2">สถานะพัสดุ</th>
                          <th className="py-2 text-right">สลับสถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => (
                          <tr
                            key={o.id}
                            className={`border-b last:border-0 hover:bg-white/40 cursor-pointer ${o.id === selectedOrderId ? "bg-white/80" : ""}`}
                            onClick={() => setSelectedOrderId(o.id)}
                          >
                            <td className="py-3 font-bold">{o.id} <span className="block text-[10px] text-[var(--color-text-secondary)] font-medium">{o.createdAt}</span></td>
                            <td className="py-3 font-semibold">{o.customerName}</td>
                            <td className="py-3 font-black text-[var(--color-primary)]">฿{o.total}</td>
                            <td className="py-3">
                              <span className="rounded-full bg-[var(--color-primary-50)] px-2 py-0.5 text-[10px] font-black text-[var(--color-primary)]">
                                {formatOrderStatus(o.status)}
                              </span>
                            </td>
                            <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <select
                                className="input h-8 px-2 text-[10px]"
                                value={o.status}
                                onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                              >
                                <option value="waiting_payment">รอชำระเงิน</option>
                                <option value="paid">จ่ายเงินแล้ว</option>
                                <option value="cod">ปลายทาง</option>
                                <option value="processing">จัดเตรียมห่อ</option>
                                <option value="shipped">จัดส่งขนส่ง</option>
                                <option value="completed">เสร็จสิ้นออเดอร์</option>
                                <option value="cancelled">ยกเลิกออเดอร์</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* แผงพรีวิวจัดส่งและปริ้นเอกสารใบเสร็จทางขวา */}
                <aside className="glass p-5 border border-[var(--color-border)] h-fit bg-white/70">
                  <h3 className="font-display text-base font-bold border-b pb-2 mb-4">🔎 รายละเอียดและพัสดุผู้รับ</h3>
                  {!selectedOrder ? (
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold text-center py-6">เลือกออเดอร์ที่ต้องการจากตารางเพื่อดูประวัติและปริ้นพัสดุ</p>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div className="bg-white/80 rounded-xl p-4 border shadow-sm">
                        <p className="font-bold text-sm text-[var(--color-primary)]">เลขอ้างอิง: {selectedOrder.id}</p>
                        <p className="mt-1 text-[10px] text-[var(--color-text-secondary)] font-bold">ลูกค้า: {selectedOrder.customerName} · วันสร้าง: {selectedOrder.createdAt}</p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" className="btn btn-secondary h-8 px-3 text-[10px] cursor-pointer" onClick={() => printOrder(selectedOrder, "shipping")}>
                            พิมพ์ใบหน้ากล่อง
                          </button>
                          <button type="button" className="btn btn-secondary h-8 px-3 text-[10px] cursor-pointer" onClick={() => printOrder(selectedOrder, "receipt")}>
                            พิมพ์ใบเสร็จย่อ
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/80 rounded-xl p-4 border shadow-sm">
                        <p className="font-bold mb-2">🚚 การจัดส่งและรหัสติดตาม</p>
                        <div className="space-y-2">
                          <label className="block">
                            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold">เลขแทรคกิ้งขนส่ง (Tracking)</span>
                            <input
                              className="input h-8 w-full px-2 mt-1 text-xs"
                              value={selectedOrder.trackingNumber ?? ""}
                              onChange={(e) => onUpdateOrder(selectedOrder.id, { trackingNumber: e.target.value })}
                              placeholder="เช่น TH01020304"
                            />
                          </label>

                          <div className="bg-stone-50 border p-3 rounded-lg text-[10px] font-semibold">
                            <p className="font-bold text-[var(--color-text)]">ผู้รับ: {selectedOrder.shippingName}</p>
                            <p className="mt-0.5 text-[var(--color-text-secondary)]">เบอร์โทร: {selectedOrder.shippingPhone}</p>
                            <p className="mt-1.5 leading-relaxed whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            )}

            {/* 5. แท็บสถิติจำนวนลูกค้า CRM */}
            {tab === "customers" && (
              <div className="glass p-6 border border-[var(--color-border)] bg-white/50">
                <h3 className="font-display text-lg font-bold border-b pb-3 mb-4">📊 ทำเนียบลูกค้ายอดนิยม (CRM Dashboard)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b text-[var(--color-text-secondary)] font-bold">
                        <th className="py-2">ชื่อผู้ลงทะเบียน</th>
                        <th className="py-2">จำนวนออเดอร์สะสม</th>
                        <th className="py-2">ยอดใช้จ่ายรวม (บาท)</th>
                        <th className="py-2 text-right">คำสั่งซื้อยอดล่าสุด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center font-bold py-6 text-xs text-[var(--color-text-secondary)]">
                            ยังไม่มีฐานลูกค้าสั่งออเดอร์ในคลังระบบ
                          </td>
                        </tr>
                      ) : (
                        customers.map((c) => (
                          <tr key={c.name} className="border-b last:border-0 hover:bg-white/40">
                            <td className="py-3 font-bold">{c.name}</td>
                            <td className="py-3 font-semibold">{c.orderCount} ออเดอร์</td>
                            <td className="py-3 font-black text-[var(--color-primary)]">{formatMoney(c.spent)}</td>
                            <td className="py-3 text-right text-[10px] font-bold text-[var(--color-text-secondary)]">{c.lastOrderAt}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. แท็บคัดกรองข้อความรีวิว */}
            {tab === "reviews" && (
              <div className="glass p-6 border border-[var(--color-border)] bg-white/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
                  <h3 className="font-display text-lg font-bold">ข้อความตอบกลับและเสียงพึงพอใจลูกค้า</h3>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      className="input h-10 px-2 text-xs"
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as any)}
                    >
                      <option value="all">แสดงสิทธิ์ทั้งหมด</option>
                      <option value="approved">อนุมัติแล้ว</option>
                      <option value="pending">รอการอนุมัติ</option>
                      <option value="hidden">ซ่อนรีวิว</option>
                    </select>

                    <input
                      className="input h-10 w-full sm:w-48 px-3 text-xs"
                      placeholder="ค้นหาข้อความ..."
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {filteredReviews.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold text-center py-6">ไม่มีรายการข้อคิดเห็นรีวิวเพิ่มเติมค่ะ</p>
                  ) : (
                    filteredReviews.map((r) => {
                      const product = products.find((p) => p.id === r.productId);
                      return (
                        <div key={r.id} className="p-4 bg-white/80 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-sm">{r.userName}</strong>
                              <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">{r.createdAt}</span>
                              <span className="text-yellow-500 font-bold">★ {r.rating}</span>
                              <span className="text-[10px] bg-[var(--color-primary-50)] text-[var(--color-primary)] font-black px-2 py-0.5 rounded-full uppercase">
                                {r.status ?? "approved"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] font-bold mt-1">รีวิวสินค้า: {product?.name ?? r.productId} {r.skinTone ? `· โทนผิว: ${r.skinTone}` : ""}</p>
                            <p className="text-xs text-[var(--color-text)] mt-2 font-medium">"{r.comment}"</p>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0">
                            <button type="button" className="btn btn-secondary h-8 px-3 text-[10px] cursor-pointer" onClick={() => onUpdateReview(r.id, { status: "approved" })}>อนุมัติ</button>
                            <button type="button" className="btn btn-secondary h-8 px-3 text-[10px] cursor-pointer text-amber-600 border-amber-100 hover:bg-amber-50" onClick={() => onUpdateReview(r.id, { status: "hidden" })}>ซ่อน</button>
                            <button type="button" className="btn btn-secondary h-8 px-3 text-[10px] cursor-pointer text-red-500 border-red-100 hover:bg-red-50" onClick={() => onDeleteReview(r.id)}>ลบ</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 7. แท็บสรุปวิเคราะห์ยอดขายและ Export */}
            {tab === "reports" && (
              <div className="glass p-6 border border-[var(--color-border)] bg-white/50 space-y-6">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <h3 className="font-display text-lg font-bold">สรุปสถิติบัญชีและการวิเคราะห์ยอด</h3>
                  <button type="button" className="btn btn-secondary h-10 px-4 cursor-pointer text-xs font-bold" onClick={exportOrdersCsv}>
                    📥 ดาวน์โหลดข้อมูลใบสั่งซื้อ (CSV)
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="bg-white/80 rounded-2xl p-5 border shadow-sm">
                    <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">ยอดจำหน่ายสะสมรายวัน</p>
                    <div className="space-y-3">
                      {salesByDay.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-secondary)] text-center font-bold">ยังไม่พบประวัติยอดจำหน่ายในคลังข้อมูล</p>
                      ) : (
                        (() => {
                          const max = Math.max(...salesByDay.map((x) => x.total), 1);
                          return salesByDay.slice(-7).map((d) => {
                            const pct = Math.max(8, Math.round((d.total / max) * 100));
                            return (
                              <div key={d.date} className="flex items-center gap-3 text-xs font-semibold">
                                <span className="w-20 text-[var(--color-text-secondary)] font-bold">{d.date}</span>
                                <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-16 text-right font-black text-[var(--color-primary)]">{formatMoney(d.total)}</span>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-2xl p-5 border shadow-sm">
                    <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Top 5 เครื่องสำอางสร้างยอดขายสูงสุด</p>
                    <div className="space-y-2">
                      {topProducts.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-secondary)] text-center font-bold">ยังไม่มีสรุปสินค้าจัดจำหน่าย</p>
                      ) : (
                        topProducts.map((p, idx) => (
                          <div key={p.name} className="flex justify-between items-center text-xs p-3 bg-stone-50 rounded-xl border border-[var(--color-border)]">
                            <div>
                              <strong className="text-[var(--color-text)] font-black">#{idx + 1} {p.name}</strong>
                              <span className="block text-[10px] text-[var(--color-text-secondary)] font-bold mt-0.5">จำนวนสะสม: {p.qty} ชิ้น</span>
                            </div>
                            <span className="font-black text-[var(--color-primary)] text-sm">{formatMoney(p.total)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. แท็บคุมข้อมูลการจัดส่ง */}
            {tab === "settings" && (
              <div className="glass p-6 border border-[var(--color-border)] bg-white/50">
                <h3 className="font-display text-lg font-bold border-b pb-3 mb-4">⚙️ กำหนดโครงสร้างร้านและเกณฑ์จัดส่ง</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  
                  {/* กำหนดราคาค่าจัดส่งพัสดุ */}
                  <div className="bg-white/80 rounded-2xl p-5 border shadow-sm">
                    <p className="font-bold text-sm mb-4">🚚 เกณฑ์ค่าขนส่งสินค้า</p>
                    <div className="space-y-4 text-xs">
                      <label className="block">
                        <span className="text-[var(--color-text-secondary)] font-bold">เกณฑ์สั่งซื้อครบเพื่อจัดส่งฟรี (บาท)</span>
                        <input
                          className="input h-10 w-full px-3 mt-2 font-bold"
                          type="number"
                          value={settings.freeShippingThreshold}
                          onChange={(e) => onUpdateSettings({ freeShippingThreshold: Math.max(0, parseInt(e.target.value) || 0) })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[var(--color-text-secondary)] font-bold">ราคาค่าจัดส่งปกติรายชิ้น (บาท)</span>
                        <input
                          className="input h-10 w-full px-3 mt-2 font-bold"
                          type="number"
                          value={settings.shippingFee}
                          onChange={(e) => onUpdateSettings({ shippingFee: Math.max(0, parseInt(e.target.value) || 0) })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* กำหนดค่าแจ้งเตือนสต็อกต่ำ */}
                  <div className="bg-white/80 rounded-2xl p-5 border shadow-sm">
                    <p className="font-bold text-sm mb-4">⚠️ ระบบแจ้งเตือนหลังร้าน</p>
                    <label className="block text-xs">
                      <span className="text-[var(--color-text-secondary)] font-bold">เกณฑ์แจ้งสต็อกต่ำรายเฉดสี (ชิ้น)</span>
                      <input
                        className="input h-10 w-full px-3 mt-2 font-bold"
                        type="number"
                        value={settings.lowStockThreshold}
                        onChange={(e) => onUpdateSettings({ lowStockThreshold: Math.max(0, parseInt(e.target.value) || 0) })}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
