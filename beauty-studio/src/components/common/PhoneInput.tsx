"use client";

export function PhoneInput({
  label,
  country,
  number,
  onChangeCountry,
  onChangeNumber,
}: {
  label: string;
  country: string;
  number: string;
  onChangeCountry: (country: string) => void;
  onChangeNumber: (number: string) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-[var(--color-text)]">
        {label}
      </span>
      <div className="relative mt-3">
        <div className="absolute inset-y-0 left-4 flex items-center gap-2 border-r border-[var(--color-border)] pr-3 text-sm font-bold text-[var(--color-text)]">
          <select
            className="bg-transparent outline-none"
            value={country}
            onChange={(event) => onChangeCountry(event.target.value)}
          >
            <option value="TH">TH</option>
            <option value="US">US</option>
            <option value="ES">ES</option>
            <option value="MR">MR</option>
          </select>
        </div>
        <input
          type="tel"
          placeholder="+66 8X XXX XXXX"
          className="input w-full pl-[5.5rem] text-sm text-[var(--color-text)]"
          value={number}
          onChange={(event) => onChangeNumber(event.target.value)}
        />
      </div>
    </label>
  );
}

