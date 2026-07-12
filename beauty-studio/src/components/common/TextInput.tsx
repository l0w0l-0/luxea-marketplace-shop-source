"use client";

export function TextInput({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-[var(--color-text)]">
        {label}
      </span>
      <input
        className="input mt-3 w-full text-sm text-[var(--color-text)]"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

