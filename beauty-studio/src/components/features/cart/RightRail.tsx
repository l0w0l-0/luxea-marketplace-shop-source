/*
==================================================
ไฟล์: components/features/cart/RightRail.tsx

หน้าที่:
แถบด้านข้างขวาแสดงตะกร้าและบัญชี

ใช้สำหรับ:
- หน้า Home

ทำงานร่วมกับ:
- BeautyShopApp
- Utils (formatMoney, getImageSrc)
- Cart Types, User Types, Order Types

หมายเหตุ:
แสดงเฉพาะบน Desktop (lg:block) แบบ Sticky
==================================================
*/

"use client";

import { CartItem, Product, User, Order } from "@/src/types";
import { formatMoney, getImageSrc } from "@/src/utils";

/**
 * แถบด้านข้างขวา
 *
 * จุดประสงค์: แสดงบัญชี ตะกร้า และโค้ดส่วนลด
 * Input: cart, products, total, shipping, grandTotal, user, orders, setView
 * Output: JSX Element
 */
export function RightRail({
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
              <span>{"\u00B7"} {user.points} points</span>
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
                      {color?.name ?? "-"} {"\u00B7"} x{item.quantity}
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
            <span className="font-medium">{formatMoney(total)}</span>
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
            <span className="text-[var(--color-primary)]">{formatMoney(grandTotal)}</span>
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
            ลดเพิ่ม 10% เมื่อสั่งซื้อขั้นต่ำ {"\u0E3F"}500
          </p>
        </div>
        <button className="btn btn-secondary w-full mt-4" onClick={() => setView("checkout")}>
          ใช้โค้ดในหน้าชำระเงิน
        </button>
      </Panel>
    </aside>
  );
}

/**
 * Panel wrapper component
 *
 * จุดประสงค์: สร้าง Card section ที่มีหัวข้อ
 * Input: title, children
 * Output: JSX Element
 */
export function Panel({
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