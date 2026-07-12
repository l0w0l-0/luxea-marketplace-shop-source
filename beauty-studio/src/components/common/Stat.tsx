"use client";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

