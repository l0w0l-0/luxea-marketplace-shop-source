/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

/**
 * แผ่นกระดานจัดวางเนื้อหาด้านข้าง (Sided Container Panel Box)
 * เป็นกล่องจัดหมวดหมู่ตกแต่งด้วยกระจกขุ่น (Frosted Glass Panel) พร้อมสไตล์ Border สวยงาม
 */
export function Panel({ title, children }: PanelProps) {
  return (
    <section className="glass p-6 border border-white/40 bg-white/45 backdrop-blur-md rounded-[var(--radius-xl)] shadow-sm">
      <h2 className="mb-4 border-b border-[var(--color-border)] pb-3 text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
        {title}
      </h2>
      <div className="text-sm">
        {children}
      </div>
    </section>
  );
}
