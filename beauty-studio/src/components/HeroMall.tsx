/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getImageSrc, formatMoney } from "../shared/commerce";
import { PromoCard } from "./Shared";

interface HeroMallProps {
  setView: (v: any) => void;
  freeShippingThreshold: number;
}

/**
 * แบนเนอร์แคมเปญหลักหน้าร้าน (Main Campaign Hero Banner)
 * แสดงรูปพรีเซนเตอร์ แคมเปญลดราคา Rosy Edit และสิทธิพิเศษของร้าน เพื่อดึงดูดลูกค้า
 */
export default function HeroMall({
  setView,
  freeShippingThreshold,
}: HeroMallProps) {
  
  // โหลดรูปภาพ Campaign Model สุดหรูหราผ่านระบบ API Proxy เพื่อป้องกัน CORS
  const heroModelImage = getImageSrc(
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=editorial%20beauty%20portrait%20of%20a%20young%20woman%20soft%20glam%20makeup%20dewy%20skin%20warm%20ivory%20background%20luxury%20cosmetics%20campaign%20soft%20studio%20lighting%20high-end%20fashion%20photography%20ultra%20realistic&image_size=portrait_4_3",
  );

  return (
    <div className="space-y-4">
      {/* ส่วนแบนเนอร์หลักพร้อมแบคกราวด์ไล่เฉดสีสุดหวาน */}
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-gradient-to-br from-[rgba(183,110,121,0.16)] via-[rgba(255,253,252,0.86)] to-[rgba(242,216,201,0.55)] p-8 shadow-[0_28px_90px_rgba(120,80,90,0.16)]">
        
        {/* เลเยอร์วงกลมสะท้อนแสงเบลอ ๆ ตกแต่งพื้นหลัง */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[rgba(183,110,121,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-[rgba(242,216,201,0.24)] blur-3xl" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          
          {/* ข้อมูลเนื้อหาแคมเปญ */}
          <div className="min-w-0 z-10">
            <div className="hero-kicker">
              <span>Rosy Edit</span>
              <span>•</span>
              <span>soft luxury</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="soft-badge shrink-0">
                ✨ Best Seller
              </span>
              <span className="soft-badge shrink-0">
                🚚 ส่งฟรี
              </span>
              <span className="soft-badge shrink-0">
                🎟 สมาชิกลดเพิ่ม
              </span>
            </div>
            
            <h2 className="mt-5 text-4xl md:text-5xl font-display leading-tight text-[var(--color-text)] font-black">
              นุ่มละมุนขึ้นอีกขั้น
              <span className="block text-[var(--color-primary)] mt-1">
                กับลุคชมพูแพงลดสูงสุด 45%
              </span>
            </h2>
            
            <p className="mt-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              เครื่องสำอางระดับพรีเมียมคัดสรรพิเศษสำหรับทุกลุคโทน Rosy, Glossy, Soft-focus 
              ที่แต่งง่าย เข้ากับทุกสีผิว ดูสุขภาพดี และยังคงความเรียบหรูแบบฉบับ LUXEA
            </p>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn btn-primary cursor-pointer" onClick={() => setView("shop")}>
                ช้อป rosy picks →
              </button>
              <button className="btn btn-secondary cursor-pointer" onClick={() => setView("wishlist")}>
                ♡ เซฟลุคโปรด
              </button>
            </div>
          </div>

          {/* รูปภาพแคมเปญ */}
          <div className="relative z-10">
            <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/70 bg-white/55 p-4 shadow-[0_22px_70px_rgba(120,80,90,0.14)] lg:pb-24">
              <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/70 bg-white aspect-4/3">
                <img
                  src={heroModelImage}
                  alt="LUXEA campaign model"
                  className="h-[260px] w-full object-cover object-[center_top] md:h-[300px] hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.20),transparent_60%)]" />
              </div>

              {/* ป้ายคะแนนสะสม/ข้อมูลบริการที่ลอยอยู่ทับแบนเนอร์ด้านล่าง */}
              <div className="pointer-events-none mt-4 rounded-[var(--radius-xl)] border border-white/70 bg-white/78 px-5 py-4 shadow-md backdrop-blur-xl lg:absolute lg:left-1/2 lg:bottom-6 lg:mt-0 lg:min-w-[320px] lg:-translate-x-1/2">
                <p className="text-[10px] font-bold tracking-[0.24em] text-[var(--color-text-secondary)] text-center">
                  LOVE NOTES FROM LUXEA
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
                    <p className="mt-1 text-[var(--color-text-secondary)]">เฉพาะ VIP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* กล่องโปรโมชั่นเสริม 2 ด้านล่างของสไลด์ */}
      <section className="grid gap-4 sm:grid-cols-2">
        <PromoCard title="VIP Beauty Privilege" text="รับของสมนาคุณสุดหรูสำหรับระดับสมาชิก VIP" tone="dark" />
        <PromoCard
          title="New Arrivals Special"
          text="อัปเดตเฉดสีใหม่ประจำสัปดาห์ใน Soft Studio"
          tone="gold"
        />
      </section>
    </div>
  );
}
