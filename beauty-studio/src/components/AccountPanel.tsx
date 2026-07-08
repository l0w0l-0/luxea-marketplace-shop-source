/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useState } from "react";
import { User, Order } from "../types";
import { formatOrderStatus } from "../shared/commerce";
import { TextInput, PhoneInput, Stat } from "./Shared";

interface AccountPanelProps {
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
}

/**
 * แผงควบคุมหน้าบัญชีของฉันและส่วนล็อกอิน (Account Panel & Auth System Screen)
 * ตรวจจับบทบาทของผู้ใช้ (ลูกค้า/แอดมิน) จัดการประวัติการสั่งซื้อ และแสดงระดับสมาชิกรวมถึงแต้มสะสม
 */
export default function AccountPanel({
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
}: AccountPanelProps) {
  
  // กรณีลงทะเบียนและลงชื่อเข้าใช้งานเรียบร้อยแล้ว
  if (user) {
    const myOrders =
      user.role === "customer"
        ? orders.filter((o) => o.customerName === user.name)
        : orders;

    return (
      <section className="glass-xl p-8 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-border)] pb-4 mb-6">
          <div>
            <h2 className="text-3xl font-display text-[var(--color-text)] font-black">
              ยินดีต้อนรับคุณ {user.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {user.role === "admin" ? "ประเภทสิทธิ์: ผู้ดูแลระบบสูงสุด (Administrator)" : "ประเภทสิทธิ์: สมาชิกคลังพรีเมียม (Customer)"}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {user.role === "admin" && (
              <span className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-4 py-2 text-xs font-bold text-[var(--color-primary)] shadow-sm">
                🛠️ Admin Access Mode Active
              </span>
            )}
            {user.role === "admin" && (
              <button
                type="button"
                className="btn btn-primary h-11 px-5 cursor-pointer text-xs"
                onClick={() => setView("admin")}
              >
                ไปแผงควบคุมหลังบ้าน (Admin Control)
              </button>
            )}
          </div>
        </div>

        {/* ตารางแสดงคุณสมบัติสมาชิกและการ์ดข้อมูลสะสม */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Stat label="ชื่อบัญชี" value={user.name} />
          <Stat label="อีเมลผูกบัญชี" value={user.email} />
          <Stat label="ระดับชั้นสมาชิก (Tier)" value={user.tier} />
          <Stat label="คะแนนสะสมความงาม (Points)" value={`${user.points} แต้ม`} />
        </div>

        {/* ประวัติการสั่งซื้อสินค้าของคุณ */}
        <div className="mt-6 border-t border-[var(--color-border)] pt-6 pb-6">
          <h3 className="text-xl font-display text-[var(--color-text)] font-bold">
            {user.role === "admin" ? "ออเดอร์ล่าสุดของร้านทั้งหมด" : "ประวัติการสั่งซื้อของฉัน"}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-semibold">
            แสดงประวัติออเดอร์ย้อนหลังทั้งหมด คอยอัปเดตสถานะการจัดส่ง
          </p>

          <div className="mt-4 grid gap-3">
            {myOrders.length === 0 ? (
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 text-sm text-[var(--color-text-secondary)] text-center font-semibold">
                ท่านยังไม่มีประวัติคำสั่งซื้อสินค้าในระบบ
              </div>
            ) : (
              myOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5 shadow-sm transition hover:bg-white"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text)]">
                        เลขอ้างอิงออเดอร์: {order.id}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-semibold">
                        ทำรายการเมื่อ: {order.createdAt} · จ่ายโดย: {order.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
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

        <button type="button" className="btn btn-secondary cursor-pointer h-10 px-5 text-xs font-bold" onClick={onLogout}>
          ลงชื่อออกจากระบบ
        </button>
      </section>
    );
  }

  // กรณีหน้าจอล็อกอิน / สมัครสมาชิกใหม่
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start animate-fade-in">
      
      {/* ฝั่งสิทธิประโยชน์ความหรูหรา */}
      <div className="glass h-fit p-8 border border-[var(--color-border)] bg-white/45">
        <h2 className="text-3xl font-display text-[var(--color-text)] font-black leading-tight">
          เข้าสู่ระบบ LUXEA
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          ร่วมสัมผัสประสบการณ์ช้อปปิ้งพรีเมียมในแบบ Beauty Studio แยกการจัดการระบบออเดอร์อย่างชาญฉลาด รวดเร็ว และเป็นระเบียบ
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--color-primary)]">บัญชีลูกค้าทั่วไป</p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)] leading-relaxed font-semibold">
              เพลิดเพลินกับการหยิบสินค้าลงตะกร้า, จัดการเซฟสกินโทนใน Wishlist, และส่งความคิดเห็นรีวิว
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--color-primary)]">แผงผู้ควบคุมร้าน</p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)] leading-relaxed font-semibold">
              แผงลอยสถิติธุรกิจอัปเดตสต็อกสินค้า, ปรับเปลี่ยนราคารายสี และพิมพ์เอกสารพัสดุ
            </p>
          </div>
        </div>
      </div>

      {/* ฝั่งฟอร์มอินพุตสลับการแสดงผล */}
      <div className="glass-xl p-8 border border-[var(--color-border)] bg-white/80">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-border)] pb-4">
          <h3 className="text-2xl font-display text-[var(--color-text)] font-black">
            {mode === "login" ? "ลงชื่อเข้าใช้งาน" : "สร้างสิทธิ์สมาชิก"}
          </h3>
          
          <div className="segmented-control">
            <div className="tabs">
              <input
                type="radio"
                id="radio-1"
                checked={mode === "login"}
                onChange={() => setMode("login")}
              />
              <label className="tab cursor-pointer text-xs font-bold" htmlFor="radio-1">
                Login
              </label>
              <input
                type="radio"
                id="radio-2"
                checked={mode === "register"}
                onChange={() => setMode("register")}
              />
              <label className="tab cursor-pointer text-xs font-bold" htmlFor="radio-2">
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

        {/* แบบฟอร์มกรอกล็อกอิน */}
        {mode === "login" ? (
          <form className="mt-4" onSubmit={onLogin}>
            <TextInput
              label="ที่อยู่อีเมลเข้าใช้งาน"
              placeholder="กรอกอีเมลของคุณ (เช่น you@email.com หรือ admin@luxea.test)"
              value={loginForm.email}
              onChange={(value) => setLoginForm({ ...loginForm, email: value })}
            />
            <TextInput
              label="รหัสผ่านเข้าสู่ระบบ"
              placeholder="กรอกรหัสผ่านเพื่อความปลอดภัย"
              type="password"
              value={loginForm.password}
              onChange={(value) => setLoginForm({ ...loginForm, password: value })}
            />
            
            <p className="text-[11px] text-[var(--color-text-secondary)] font-bold mt-4 leading-relaxed bg-amber-50 rounded border border-amber-100 p-2 text-amber-800">
              💡 ทดลองเข้าระบบแอดมิน: กรอกอีเมล <strong>admin@luxea.test</strong> รหัสอะไรก็ได้
            </p>

            <button type="submit" className="btn btn-primary w-full mt-6 cursor-pointer py-3 text-sm font-bold">
              เข้าสู่ระบบสมาชิก
            </button>
          </form>
        ) : (
          /* แบบฟอร์มสร้างสิทธิ์การสมัครใหม่ */
          <form className="mt-4" onSubmit={onRegister}>
            <TextInput
              label="ชื่อจริงผู้ใช้งาน"
              placeholder="กรอกชื่อที่พึงประสงค์แสดงผล"
              value={registerForm.name}
              onChange={(value) => setRegisterForm({ ...registerForm, name: value })}
            />
            <TextInput
              label="อีเมลสมาชิกใหม่"
              placeholder="ตัวอย่างคุณ @youremail.com"
              value={registerForm.email}
              onChange={(value) => setRegisterForm({ ...registerForm, email: value })}
            />
            <TextInput
              label="กำหนดรหัสผ่านความปลอดภัย"
              type="password"
              placeholder="รหัสผ่านไม่ควรต่ำกว่า 6 ตัวอักษร"
              value={registerForm.password}
              onChange={(value) => setRegisterForm({ ...registerForm, password: value })}
            />

            <PhoneInput
              label="เบอร์โทรศัพท์สำหรับรับข่าวสารพรีเมียม"
              country={registerForm.phoneCountry}
              number={registerForm.phoneNumber}
              onChangeCountry={(country) =>
                setRegisterForm({ ...registerForm, phoneCountry: country })
              }
              onChangeNumber={(number) =>
                setRegisterForm({ ...registerForm, phoneNumber: number })
              }
            />

            <button type="submit" className="btn btn-secondary w-full mt-6 cursor-pointer py-3 text-sm font-bold">
              ยืนยันการสมัครสมาชิกพรีเมียม
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
