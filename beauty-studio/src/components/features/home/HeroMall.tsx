/*
==================================================
ไฟล์: components/features/home/HeroMall.tsx

หน้าที่:
แสดง Hero Section หน้าแรกของร้านค้า

ใช้สำหรับ:
- หน้า Home
- โปรโมชันและแคมเปญ

ทำงานร่วมกับ:
- BeautyShopApp
- Utils (getImageSrc, formatMoney)

หมายเหตุ:
มี PromoCard เป็น Sub-component
==================================================
*/

"use client";

import { getImageSrc, formatMoney } from "@/src/utils";

/**
 * Hero Section หน้าแรก
 *
 * จุดประสงค์: ดึงดูดผู้ใช้ด้วยภาพและข้อความโปรโมชัน
 * Input: setView, freeShippingThreshold
 * Output: JSX Element
 */
export function HeroMall({
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
              <span>{"\u2022"}</span>
              <span>soft luxury</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
              <span className="soft-badge shrink-0">
                {"\u2728"} Best Seller
              </span>
              <span className="soft-badge shrink-0">
                {"\uD83D\uDE9A"} ส่งฟรี
              </span>
              <span className="soft-badge shrink-0">
                {"\uD83C\uDF9F"} สมาชิกลดเพิ่ม
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
                ช้อป rosy picks {"\u2192"}
              </button>
              <button className="btn btn-secondary" onClick={() => setView("wishlist")}>
                {"\u2661"} เซฟลุคโปรด
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

/**
 * การ์ดโปรโมชันขนาดเล็ก
 *
 * จุดประสงค์: แสดงโปรโมชันแบบการ์ด
 * Input: title, text, tone ("dark" | "gold")
 * Output: JSX Element
 */
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