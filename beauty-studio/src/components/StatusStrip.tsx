/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatMoney } from "../shared/commerce";

interface StatusStripProps {
  message: string;
  freeShippingThreshold: number;
  onDismiss: () => void;
}

/**
 * แถบแสดงสถานะและข้อความแจ้งเตือน (Status & Notification Bar)
 * แสดงโปรโมชั่นส่งฟรี การการันตีคืนเงิน และแสดงข้อความตอบกลับการกระทำต่าง ๆ จากระบบ
 */
export default function StatusStrip({
  message,
  freeShippingThreshold,
  onDismiss,
}: StatusStripProps) {
  return (
    <div className="mb-8 rounded-[var(--radius-2xl)] bg-white/70 backdrop-blur-xl px-6 py-4 text-sm shadow-sm border border-[var(--color-border)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* สัญลักษณ์การันตีและสิทธิ์ส่งฟรีของร้าน */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50)] px-4 py-2 font-bold text-[var(--color-primary)] shadow-sm">
            🛡️ คืนเงินหากไม่ตรงปก
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50)] px-4 py-2 font-bold text-[var(--color-primary)] shadow-sm">
            🚚 ส่งฟรีเมื่อช้อปครบ {formatMoney(freeShippingThreshold)}
          </span>
        </div>

        {/* ข้อความแจ้งเตือนป๊อปอัพแบบนุ่มนวลจากระบบ */}
        {message ? (
          <div className="flex items-center gap-3 md:max-w-[44%] md:justify-end animate-fade-in">
            <div className="text-[var(--color-text-secondary)] font-medium md:text-right">
              ✨ {message}
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/70 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)] cursor-pointer"
              onClick={onDismiss}
              aria-label="ปิดข้อความแจ้งเตือน"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
