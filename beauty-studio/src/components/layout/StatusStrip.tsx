"use client";
import { formatMoney } from "@/src/utils";

export function StatusStrip({
  message,
  freeShippingThreshold,
  onDismiss,
}: {
  message: string;
  freeShippingThreshold: number;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-8 rounded-[var(--radius-2xl)] bg-white/70 backdrop-blur-xl px-6 py-4 text-sm shadow-sm border border-[var(--color-border)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50)] px-4 py-2 font-bold text-[var(--color-primary)]">
            ✅ คืนเงินหากไม่ตรงปก
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-50)] px-4 py-2 font-bold text-[var(--color-primary)]">
            🚚 ส่งฟรีเมื่อครบ {formatMoney(freeShippingThreshold)}
          </span>
        </div>
        {message ? (
          <div className="flex items-center gap-3 md:max-w-[44%] md:justify-end">
            <div className="text-[var(--color-text-secondary)] md:text-right">
              {message}
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/70 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
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

