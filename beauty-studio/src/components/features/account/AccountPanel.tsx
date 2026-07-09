/*
==================================================
ไฟล์: components/features/account/AccountPanel.tsx

หน้าที่:
แสดงหน้าบัญชีผู้ใช้และฟอร์มล็อกอิน/สมัครสมาชิก

ใช้สำหรับ:
- หน้า Account

ทำงานร่วมกับ:
- BeautyShopApp
- TextInput, PhoneInput Components
- User, Order Types

หมายเหตุ:
มีทั้งโหมด Login และ Register
==================================================
*/

"use client";

import { useState, FormEvent } from "react";
import { User, Order } from "@/src/types";
import { TextInput } from "@/src/components/common/TextInput";
import { PhoneInput } from "@/src/components/common/PhoneInput";
import { formatOrderStatus } from "@/src/utils";

/**
 * หน้าบัญชีผู้ใช้
 *
 * จุดประสงค์: แสดงข้อมูลผู้ใช้, ออเดอร์, และฟอร์มล็อกอิน/สมัคร
 * Input: user, orders, loginForm, registerForm, setLoginForm, setRegisterForm, onLogin, onRegister, setView, onLogout
 * Output: JSX Element
 */
export function AccountPanel({
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
                        {order.createdAt} {"\u00B7"} {order.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-sm font-bold text-[var(--color-text-secondary)]">
                        {formatOrderStatus(order.status)}
                      </span>
                      <span className="text-xl font-black text-[var(--color-primary)]">
                        {"\u0E3F"}{order.total}
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
              ช้อปสินค้า {"\u00B7"} Wishlist {"\u00B7"} รีวิว {"\u00B7"} ชำระเงิน
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5">
            <p className="text-sm font-bold text-[var(--color-text)]">แอดมิน</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              จัดการสต็อก {"\u00B7"} ดูออเดอร์ {"\u00B7"} ตรวจสถานะ
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

/**
 * แสดงสถิติแบบ Card
 *
 * จุดประสงค์: แสดงข้อมูลสถิติในรูปแบบ Card เล็ก
 * Input: label, value
 * Output: JSX Element
 */
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