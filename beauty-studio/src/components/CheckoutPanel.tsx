/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, Product } from "../types";
import { formatMoney, getImageSrc } from "../shared/commerce";
import { PaymentFlipCard } from "./Shared";

interface CheckoutPanelProps {
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
}

/**
 * แผงควบคุมและชำระเงินสินค้า (Checkout & Cart Panel Screen)
 * เป็นหน้าจอเดี่ยวที่รวบรวมรายการสินค้าในตะกร้า ข้อมูลที่อยู่ผู้จัดส่ง วิธีการชำระเงิน การ์ดเครดิตกราฟิก และการสรุปยอดรวมสุทธิอย่างชัดเจน
 */
export default function CheckoutPanel({
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
}: CheckoutPanelProps) {
  
  const safePaymentMethods = enabledPaymentMethods.length
    ? enabledPaymentMethods
    : (["Credit Card", "Bank Transfer", "Cash On Delivery"] as const);

  // คำนวณความคืบหน้าโปรโมชั่นส่งฟรี
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

  // รับไอคอนและชื่อวิธีกรณีชำระเงินที่แตกต่างกัน
  const paymentMeta = (method: string) => {
    if (method === "Credit Card")
      return { icon: "💳", title: "บัตรเครดิต / เดบิต (Credit Card)", subtitle: "Visa, Mastercard, JCB" };
    if (method === "Bank Transfer")
      return { icon: "🏦", title: "โอนผ่านบัญชีธนาคาร (Bank Transfer)", subtitle: "แนบหลักฐานการโอนเงิน" };
    return { icon: "🚚", title: "ชำระเงินปลายทาง (Cash On Delivery)", subtitle: "ชำระเงินสดแก่เจ้าหน้าที่จัดส่ง" };
  };

  return (
    <section className="glass-xl p-6 md:p-8 animate-fade-in">
      
      {/* 1. ส่วนหัว (Header) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-[var(--color-border)] pb-4">
        <div className="min-w-0">
          <h2 className="text-3xl font-display leading-tight text-[var(--color-text)] font-black">
            สรุปรายการในตะกร้า
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            เลือกช่องทางชำระเงิน ตรวจสอบรายการ และยืนยันคำสั่งซื้อของคุณได้ทันที
          </p>
        </div>
        <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          LUXEA · Secure Billing System
        </div>
      </div>

      {/* 2. เนื้อหาแบ่งคอลัมน์ (Left: Summary & Place Order | Right: Items & Information Form) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        
        {/* คอลัมน์ซ้าย: รายละเอียดใบเสร็จการชำระเงิน */}
        <aside className="glass p-6 h-fit bg-white/50 border border-[var(--color-border)]">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                Order Summary
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--color-text)]">
                จำนวน {summary.quantity} รายการ
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Due Today
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--color-primary)]">
                {formatMoney(summary.grandTotal)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--color-text-secondary)] font-semibold">ยอดรวมสินค้า</span>
              <span className="font-bold text-[var(--color-text)]">
                {formatMoney(summary.total)}
              </span>
            </div>
            {summary.discount > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--color-text-secondary)] font-semibold">ส่วนลดคูปอง</span>
                <span className="font-bold text-[var(--color-danger)]">
                  -{formatMoney(summary.discount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--color-text-secondary)] font-semibold">ค่าบริการจัดส่ง</span>
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
                    : "จัดส่งฟรี"
                  : formatMoney(summary.shipping)}
              </span>
            </div>
          </div>

          {/* แถบความคืบหน้าสิทธิ์จัดส่งฟรี */}
          <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold text-[var(--color-text)]">
                ส่งฟรีเมื่อยอดสั่งซื้อครบ
              </p>
              <p className="text-xs font-black text-[var(--color-primary)]">
                {formatMoney(freeShippingThreshold)}
              </p>
            </div>
            
            <div className="mt-3 h-2 rounded-full bg-[var(--color-primary-100)] overflow-hidden shadow-inner">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${freeShipProgress}%` }}
              />
            </div>
            
            {remainingForFreeShip > 0 ? (
              <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-primary-50)] px-3 py-2 text-[11px] text-[var(--color-text-secondary)] font-semibold">
                ช้อปเพิ่มอีกเพียง{" "}
                <span className="font-black text-[var(--color-primary)]">
                  {formatMoney(remainingForFreeShip)}
                </span>{" "}
                จะได้รับสิทธิ์ส่งฟรีทันที!
              </div>
            ) : (
              <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-green-50 px-3 py-2 text-[11px] text-green-700 font-bold">
                🎉 ยินดีด้วยค่ะ! คุณได้รับสิทธิ์จัดส่งสินค้าฟรี
              </div>
            )}
          </div>

          <button
            className="btn btn-primary w-full mt-6 cursor-pointer text-base py-3"
            disabled={!canCheckout}
            aria-disabled={!canCheckout}
            onClick={onCheckout}
          >
            ยืนยันคำสั่งซื้อ (Place Order)
          </button>
          
          <p className="mt-3 text-[10px] text-[var(--color-text-secondary)] text-center font-semibold leading-relaxed">
            ระบบชำระเงินที่ปลอดภัยระดับ LUXEA OS · ข้อมูลที่อยู่นี้จะจัดเก็บเป็นความลับเพื่อใช้ในการนำพัสดุจัดส่งแก่ท่านเท่านั้น
          </p>
        </aside>

        {/* คอลัมน์ขวา: รายละเอียดแบบฟอร์มและการจัดการไอเทม */}
        <div className="min-w-0 space-y-6">
          
          {/* ส่วนการเลือกวิธีการชำระเงิน */}
          <section className="glass p-6 bg-white/50 border border-[var(--color-border)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Payment Option
                </p>
                <h3 className="mt-1 text-lg font-bold text-[var(--color-text)]">
                  เลือกช่องทางการชำระเงิน
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-bold">
                เลือกวิธีที่ท่านสะดวก
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {safePaymentMethods.map((method) => {
                const meta = paymentMeta(method);
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    className={`w-full rounded-[var(--radius-xl)] border px-5 py-4 text-left transition duration-200 cursor-pointer ${
                      active
                        ? "border-[rgba(163,93,106,0.28)] bg-[rgba(163,93,106,0.10)]"
                        : "border-[var(--color-border)] bg-white/60 hover:bg-white/80"
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lg border border-white/60 shadow-sm shrink-0">
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[var(--color-text)] truncate">
                            {meta.title}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)] truncate">
                            {meta.subtitle}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border shrink-0 flex items-center justify-center ${
                          active
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                            : "border-[var(--color-border)] bg-white/70"
                        }`}
                      >
                        {active && <span className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* แสดงโมเดลบัตรเครดิต LUXEA หมุนได้กรณีชำระด้วยบัตร */}
            {paymentMethod === "Credit Card" && (
              <div className="mt-6 flex justify-center">
                <PaymentFlipCard />
              </div>
            )}
          </section>

          {/* ส่วนรายการสินค้าที่เปิดให้แก้ไขจำนวนในหน้าเช็คเอาท์ */}
          <section className="glass p-6 bg-white/50 border border-[var(--color-border)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Cart Contents
                </p>
                <h3 className="mt-1 text-lg font-bold text-[var(--color-text)]">
                  ตรวจสอบรายการสินค้าในตะกร้า
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-bold">
                จำนวนทั้งหมด {cart.length} ชนิด
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-6 text-sm text-[var(--color-text-secondary)] text-center font-semibold">
                ตะกร้าสินค้ายังคงว่างเปล่า ย้อนกลับไปเลือกสินค้าก่อนนะคะ
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
                      className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-white/60 bg-white/80 shadow-sm flex items-center justify-center">
                            <div
                              className="absolute inset-0 opacity-30"
                              style={{ backgroundColor: product.color }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-lg">
                              {product.category === "Lipstick" && "💄"}
                              {product.category === "Blush" && "🌸"}
                              {product.category === "Highlighter" && "✨"}
                              {product.category === "Foundation" && "🧴"}
                              {product.category === "Eyeshadow" && "👁️"}
                              {product.category === "Skincare" && "🧴"}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[var(--color-text)] truncate">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-text-secondary)] truncate font-semibold">
                              เฉดสี: {color?.name ?? "-"} ({color?.hex})
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary h-10 px-4 cursor-pointer text-xs font-bold text-red-500 border-red-100 hover:bg-red-50"
                          onClick={() => onRemove(item.productId, item.colorId)}
                        >
                          ลบรายการ
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-[var(--color-border)] border-dashed">
                        {/* ปรับแต่งชิ้นสินค้า */}
                        <div className="inline-flex w-full sm:w-auto items-center justify-between gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1">
                          <button
                            type="button"
                            className="btn btn-secondary h-8 w-8 p-0 flex items-center justify-center font-bold text-lg cursor-pointer"
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
                            type="button"
                            className="btn btn-secondary h-8 w-8 p-0 flex items-center justify-center font-bold text-lg cursor-pointer"
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
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                            Total Price
                          </p>
                          <p className="mt-1 text-base font-black text-[var(--color-primary)]">
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

          {/* ส่วนกรอกที่อยู่ผู้จัดส่ง */}
          <section className="glass p-6 bg-white/50 border border-[var(--color-border)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Delivery Logistics
            </p>
            <h3 className="mt-1 text-lg font-bold text-[var(--color-text)]">
              กรอกข้อมูลจัดส่งพัสดุของคุณ
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                  ชื่อ-นามสกุลผู้รับสินค้า
                </span>
                <input
                  className="input mt-2 w-full text-sm text-[var(--color-text)]"
                  value={checkoutForm.shippingName}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, shippingName: e.target.value })
                  }
                  placeholder="กรุณากรอกชื่อและนามสกุลผู้รับจริง"
                />
              </label>
              <label className="block min-w-0">
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                  เบอร์โทรศัพท์ติดต่อพัสดุ
                </span>
                <input
                  className="input mt-2 w-full text-sm text-[var(--color-text)]"
                  value={checkoutForm.shippingPhone}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, shippingPhone: e.target.value })
                  }
                  placeholder="ตัวอย่าง 0XX-XXX-XXXX"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                ที่อยู่สำหรับจัดส่งพัสดุและไปรษณีย์
              </span>
              <textarea
                className="input mt-2 w-full px-4 py-3 text-sm text-[var(--color-text)] min-h-[96px]"
                value={checkoutForm.shippingAddress}
                onChange={(e) =>
                  setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value })
                }
                placeholder="บ้านเลขที่, หมู่บ้าน/อาคาร, ซอย, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
              />
            </label>
          </section>
        </div>
      </div>
    </section>
  );
}
