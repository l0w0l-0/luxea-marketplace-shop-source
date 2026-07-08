/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, Product, User, Order } from "../types";
import { formatMoney, getImageSrc } from "../shared/commerce";
import { Panel } from "./SharedComponents";

interface RightRailProps {
  cart: CartItem[];
  products: Product[];
  total: number;
  shipping: number;
  grandTotal: number;
  user: User | null;
  orders: Order[];
  setView: (v: any) => void;
}

/**
 * พาเนลแสดงข้อมูลสรุปด้านขวาของหน้าจอ (Right Rail Sidebar Panel)
 * รวบรวมข้อมูลระดับสมาชิก ยอดคะแนนสะสม และแสดงพรีวิวสินค้าที่หยิบใส่ตะกร้าแบบย่อ
 */
export default function RightRail({
  cart,
  products,
  total,
  shipping,
  grandTotal,
  user,
  orders,
  setView,
}: RightRailProps) {
  return (
    <aside className="space-y-6 hidden lg:block sticky top-24 self-start min-w-[320px]">
      
      {/* 1. ส่วนข้อมูลสมาชิก (My Account Widget) */}
      <Panel title="บัญชีของฉัน">
        {user ? (
          <div className="space-y-2">
            <p className="text-lg font-bold text-[var(--color-text)]">{user.name}</p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] font-medium">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  user.tier === "VIP"
                    ? "bg-[var(--color-accent)] text-[#4b3b33]"
                    : "bg-[var(--color-primary-50)] text-[var(--color-primary)]"
                }`}
              >
                {user.tier}
              </span>
              <span>· คะแนนสะสม {user.points} แต้ม</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
              ลงชื่อเข้าใช้งานกับ LUXEA เพื่อสะสมคะแนน แลกรับส่วนลดและของรางวัลสมาชิก VIP สุดพิเศษมากมาย
            </p>
            <button className="btn btn-primary w-full cursor-pointer h-10 text-xs" onClick={() => setView("account")}>
              ลงชื่อเข้าสู่ระบบ
            </button>
            <button className="btn btn-secondary w-full cursor-pointer h-10 text-xs font-bold" onClick={() => setView("account")}>
              สมัครสมาชิกฟรี
            </button>
          </div>
        )}
      </Panel>

      {/* 2. พรีวิวสรุปตะกร้าสินค้าแบบย่อ (Mini Cart Summary) */}
      <Panel title="ตะกร้าสินค้าพรีวิว">
        {cart.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed py-2">
            ยังไม่มีสินค้าใดหยิบใส่ตะกร้า ช้อปปิ้งเพื่อดูสรุปรายการที่นี่!
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
                  className="flex items-center gap-3 border-b border-[var(--color-border)] pb-2 last:border-0 last:pb-0"
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
                    <p className="text-xs text-[var(--color-text-secondary)] truncate font-semibold">
                      สี: {color?.name ?? "-"} · จำนวน: x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black text-[var(--color-primary)] shrink-0">
                    {formatMoney(lineTotal)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        
        {/* รายละเอียดสรุปยอดรวมสุทธิ */}
        <div className="mt-4 border-t border-[var(--color-border)] pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)] font-semibold">สินค้า</span>
            <span className="font-bold text-[var(--color-text)]">฿{total}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)] font-semibold">
              ค่าจัดส่งสินค้า
            </span>
            <span
              className={
                shipping === 0
                  ? cart.length === 0
                    ? "font-bold text-[var(--color-text)]"
                    : "font-black text-[var(--color-success)]"
                  : "font-bold text-[var(--color-text)]"
              }
            >
              {shipping === 0
                ? cart.length === 0
                  ? formatMoney(0)
                  : "จัดส่งฟรี"
                : formatMoney(shipping)}
            </span>
          </div>
          
          <div className="flex justify-between text-lg font-black pt-2 border-t border-dashed border-[var(--color-border)]">
            <span className="text-[var(--color-text)]">ยอดสุทธิ</span>
            <span className="text-[var(--color-primary)]">฿{grandTotal}</span>
          </div>
          
          <button
            className="btn btn-primary w-full mt-4 cursor-pointer"
            onClick={() => setView("checkout")}
          >
            สั่งซื้อสินค้าและชำระเงิน
          </button>
        </div>
      </Panel>

      {/* 3. คำอธิบายคูปองแนะนำ (Recommended Coupons Panel) */}
      <Panel title="โค้ดแนะนำพิเศษ">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">
            โค้ดแนะนำวันนี้
          </p>
          <p className="mt-2 text-2xl font-black text-[var(--color-primary)]">
            LUXEA10
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-medium">
            ลดเพิ่มทันที 10% เมื่อสั่งซื้อขั้นต่ำครบ ฿500
          </p>
        </div>
        <button className="btn btn-secondary w-full mt-4 cursor-pointer font-bold h-10 text-xs" onClick={() => setView("checkout")}>
          ไปกรอกโค้ดในหน้าเช็คเอาท์
        </button>
      </Panel>
    </aside>
  );
}
