/*
==================================================
ไฟล์: components/features/cart/CheckoutPanel.tsx

หน้าที่:
หน้าชำระเงิน (Checkout)

ใช้สำหรับ:
- หน้า Checkout

ทำงานร่วมกับ:
- BeautyShopApp
- CartItem, Product Types
- Utils (formatMoney, getImageSrc)

หมายเหตุ:
รองรับหลายช่องทางชำระเงิน
==================================================
*/

"use client";

import { CartItem, Product } from "@/src/types";
import { formatMoney } from "@/src/utils";
import { CATEGORY_ICONS } from "@/src/constants";

/**
 * หน้าชำระเงิน
 *
 * จุดประสงค์: แสดงรายการสินค้าและฟอร์มจัดส่ง
 * Input: cart, products, checkoutForm, setCheckoutForm, paymentMethod, setPaymentMethod,
 *        enabledPaymentMethods, summary, freeShippingThreshold, onCheckout,
 *        onUpdateQuantity, onRemove
 * Output: JSX Element
 */
export function CheckoutPanel({
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
  isProcessing,
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
  setPaymentMethod: (value: "Credit Card" | "Bank Transfer" | "Cash On Delivery") => void;
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
  isProcessing?: boolean;
}) {
  const safePaymentMethods = enabledPaymentMethods.length
    ? enabledPaymentMethods
    : (["Credit Card", "Bank Transfer", "Cash On Delivery"] as Array<
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
      return { icon: "\uD83D\uDCB3", title: "Credit / debit card", subtitle: "Visa, Mastercard" };
    if (method === "Bank Transfer")
      return { icon: "\uD83C\uDFE6", title: "Bank transfer", subtitle: "โอนเงินผ่านธนาคาร" };
    return { icon: "\uD83D\uDE9A", title: "Cash on delivery", subtitle: "ชำระเงินปลายทาง" };
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
          LUXEA {"\u00B7"} Secure Checkout
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
            disabled={!canCheckout || isProcessing}
            aria-disabled={!canCheckout || isProcessing}
            onClick={onCheckout}
          >
            {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
          </button>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            ชำระเงินปลอดภัย {"\u00B7"} ข้อมูลการจัดส่งใช้เพื่อออกใบจัดส่งและติดตามพัสดุ
          </p>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="glass p-6">
            {/* Payment Method Selection */}
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
                            <div className="absolute inset-0 flex items-center justify-center text-lg">
                              {CATEGORY_ICONS[product.category] || "\uD83D\uDECD\uFE0F"}
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
                              onUpdateQuantity(item.productId, item.colorId, item.quantity - 1)
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
                              onUpdateQuantity(item.productId, item.colorId, item.quantity + 1)
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
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingName: e.target.value })}
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
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingPhone: e.target.value })}
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
                onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value })}
                placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
              />
            </label>
          </section>
        </div>
      </div>
    </section>
  );
}

/**
 * การ์ดเครดิตจำลอง
 *
 * จุดประสงค์: แสดงตัวอย่างบัตรเครดิต
 * Output: JSX Element
 */
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