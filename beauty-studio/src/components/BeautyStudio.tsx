/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";

/**
 * สตูดิโอปรับแต่งสีความงามเสมือนจริง (LUXEA Virtual Beauty Studio Screen)
 * ช่วยให้คุณลูกค้าสามารถทดสอบสีของลิปสติก บลัชออน ไฮไลท์เตอร์ และฟาวน์เดชัน ผสมสีที่พึงพอใจเพื่อบันทึกเป็นลุคโปรดของตัวเอง
 */
export default function BeautyStudio() {
  
  // จัดเก็บเฉดสีจำลองที่ทดลองเล่น
  const [makeup, setMakeup] = useState({
    lipstick: "#D96483",
    blush: "#E8B4B8",
    highlighter: "#D7B9AE",
    foundation: "#E3C8BC",
  });

  const makeupOptions = [
    {
      name: "ลิปสติก (Lipstick Swatches)",
      key: "lipstick" as const,
      colors: ["#D96483", "#E2583E", "#7A283D", "#B84A6C"],
    },
    {
      name: "บลัชออนปัดแก้ม (Blush Swatches)",
      key: "blush" as const,
      colors: ["#E8B4B8", "#F2A284", "#D88C9A"],
    },
    {
      name: "ไฮไลท์เตอร์ชิมเมอร์ (Highlighter Swatches)",
      key: "highlighter" as const,
      colors: ["#D7B9AE", "#E2A49A", "#F1D2C5"],
    },
    {
      name: "รองพื้นเนื้อบางเบา (Foundation Swatches)",
      key: "foundation" as const,
      colors: ["#F5E1D3", "#E3C8BC", "#CEB2A6"],
    },
  ];

  return (
    <section className="glass-xl p-8 border border-[var(--color-border)] animate-fade-in bg-white/60">
      <h2 className="text-3xl font-display text-[var(--color-primary)] font-black mb-6">
        💄 LUXEA Virtual Beauty Studio
      </h2>
      <p className="text-xs text-[var(--color-text-secondary)] mb-8 font-semibold uppercase tracking-wider">
        ทดลองสลับเฉดสีที่พึงพอใจ เพื่อจับคู่อันเดอร์โทนและเนื้อฟินิชก่อนตัดสินใจหยิบลงตะกร้าจริง
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        
        {/* คอลัมน์ซ้าย: หน้าต่างโมเดลจำลองสีผิวความงาม (Visual Color Previewer) */}
        <div className="bg-white rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 flex flex-col items-center justify-center shadow-inner min-h-[360px]">
          
          <div className="relative w-full max-w-sm aspect-video bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-accent-100)] rounded-[var(--radius-2xl)] flex items-center justify-center shadow-md relative overflow-hidden">
            
            {/* โชว์พาเนลเฉดสีสะท้อนแสงจำลองบนรูปปากกาและโมเดล */}
            <div className="absolute inset-x-0 bottom-0 bg-white/70 p-4 border-t border-[var(--color-border)] flex justify-around text-center text-[10px] font-bold">
              <div>
                <p className="text-[var(--color-text-secondary)]">LIP</p>
                <span className="inline-block h-3.5 w-3.5 rounded-full border shadow-sm mt-1" style={{ backgroundColor: makeup.lipstick }} />
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)]">BLUSH</p>
                <span className="inline-block h-3.5 w-3.5 rounded-full border shadow-sm mt-1" style={{ backgroundColor: makeup.blush }} />
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)]">GLOW</p>
                <span className="inline-block h-3.5 w-3.5 rounded-full border shadow-sm mt-1" style={{ backgroundColor: makeup.highlighter }} />
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)]">BASE</p>
                <span className="inline-block h-3.5 w-3.5 rounded-full border shadow-sm mt-1" style={{ backgroundColor: makeup.foundation }} />
              </div>
            </div>

            <span className="text-8xl select-none filter drop-shadow">💄</span>
          </div>

          <p className="text-[11px] text-[var(--color-text-secondary)] mt-4 font-bold text-center">
            *หน้าต่างโมเดลจำลองสแกนรหัสเฉดสี Hex: LIP {makeup.lipstick} · BLUSH {makeup.blush}
          </p>
        </div>

        {/* คอลัมน์ขวา: ชุดปุ่มปรับเปลี่ยนสีเครื่องสำอาง (Color Controls Panel) */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-[var(--color-text)] border-b pb-2">
            เลือกผสมเฉดสีของคุณ
          </h3>
          
          {makeupOptions.map((option) => (
            <div key={option.name} className="glass p-4 bg-white/70 border rounded-[var(--radius-xl)] shadow-sm">
              <h4 className="font-bold text-xs mb-3 text-[var(--color-primary)]">
                {option.name}
              </h4>
              <div className="flex gap-3 flex-wrap">
                {option.colors.map((color) => {
                  const isActive = makeup[option.key] === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setMakeup((prev) => ({ ...prev, [option.key]: color }))
                      }
                      className={`color-dot cursor-pointer transition h-8 w-8 rounded-full border border-black/10 flex items-center justify-center shadow-sm hover:scale-110 ${
                        isActive ? "ring-2 ring-[var(--color-primary)] ring-offset-2 scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      title={`รหัสสี: ${color}`}
                    >
                      {isActive && <span className="text-white text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-3 pt-3">
            <button type="button" className="btn btn-primary w-full cursor-pointer py-3 font-bold text-sm">
              บันทึกลุคนี้ (Save This Look)
            </button>
            <button type="button" className="btn btn-secondary w-full cursor-pointer py-3 font-bold text-sm">
              สั่งซื้อแพ็กลุคนี้ทันที (Buy The Look)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
