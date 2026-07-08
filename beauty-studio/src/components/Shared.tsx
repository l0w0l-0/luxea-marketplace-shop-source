/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

/**
 * คอมโพเนนต์อินพุตข้อความ (Text Input Component)
 */
interface TextInputProps {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TextInput({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: TextInputProps) {
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

/**
 * คอมโพเนนต์อินพุตเบอร์โทรศัพท์ (Phone Number Input with Country Code Selector)
 */
interface PhoneInputProps {
  label: string;
  country: string;
  number: string;
  onChangeCountry: (country: string) => void;
  onChangeNumber: (number: string) => void;
}

export function PhoneInput({
  label,
  country,
  number,
  onChangeCountry,
  onChangeNumber,
}: PhoneInputProps) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-[var(--color-text)]">
        {label}
      </span>
      <div className="relative mt-3">
        <div className="absolute inset-y-0 left-4 flex items-center gap-2 border-r border-[var(--color-border)] pr-3 text-sm font-bold text-[var(--color-text)]">
          <select
            className="bg-transparent outline-none cursor-pointer"
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

/**
 * กล่องแสดงสถิติเดี่ยว (Single Stat Widget)
 */
interface StatProps {
  label: string;
  value: string;
}

export function Stat({ label, value }: StatProps) {
  return (
    <div className="glass p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

/**
 * การ์ดแบนเนอร์โปรโมชั่น (Promotion Banner Card)
 */
interface PromoCardProps {
  title: string;
  text: string;
  tone: "dark" | "gold";
}

export function PromoCard({ title, text, tone }: PromoCardProps) {
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

/**
 * แท็บเลือกวิธีการชำระเงินแบบ Segmented Control
 */
interface PaymentMethodTabsProps {
  value: string;
  onChange: (next: string) => void;
  methods?: string[];
}

export function PaymentMethodTabs({
  value,
  onChange,
  methods = ["Credit Card", "Bank Transfer", "Cash On Delivery"],
}: PaymentMethodTabsProps) {
  const selectedIndex = Math.max(0, methods.indexOf(value));
  const gliderWidth = `${100 / Math.max(1, methods.length)}%`;

  return (
    <div className="segmented-control">
      <div className="tabs">
        {methods.map((method, index) => {
          const id = `radio-${index + 1}`;
          return (
            <div key={method} className="relative">
              <input
                type="radio"
                id={id}
                checked={value === method}
                onChange={() => onChange(method)}
              />
              <label className="tab" htmlFor={id}>
                {method === "Credit Card"
                  ? "Card"
                  : method === "Bank Transfer"
                    ? "Bank"
                    : "COD"}
              </label>
            </div>
          );
        })}
        <span
          className="glider"
          style={{
            width: gliderWidth,
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * แอนิเมชันบัตรเครดิต LUXEA หมุนพลิกหน้าหลังแบบหรูหรา (Interactive Luxury Credit Card Graphic)
 */
export function PaymentFlipCard({
  cardNumber = "•••• •••• •••• ••••",
  cardName = "LUXEA MEMBER",
  cardExpiry = "MM/YY",
  cardCvv = "•••",
  isFlipped = false,
}: {
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
  isFlipped?: boolean;
}) {
  return (
    <div className="flip-card">
      <div 
        className="flip-card-inner" 
        style={isFlipped ? { transform: "rotateY(180deg)" } : undefined}
      >
        <div className="flip-card-front">
          <div className="heading_8264">LUXEA</div>
          <div className="chip">
            <div className="h-8 w-12 rounded-md bg-gradient-to-br from-[#f6d6a7] to-[#caa36f] shadow" />
          </div>
          <div className="contactless">
            <div className="h-6 w-6 rounded-full border border-white/70" />
          </div>
          <div className="logo">
            {/* Visa / MasterCard logo indicator */}
            <div className="h-8 flex items-center justify-end px-2 text-white font-black text-xs italic tracking-wider">
              {cardNumber.startsWith("4") ? "VISA" : cardNumber.startsWith("5") ? "MC" : "LUXEA"}
            </div>
          </div>
          <div className="number">{cardNumber || "•••• •••• •••• ••••"}</div>
          <div className="valid_thru">VALID THRU</div>
          <div className="date_8264">{cardExpiry || "MM/YY"}</div>
          <div className="name truncate pr-4">{cardName.toUpperCase() || "LUXEA MEMBER"}</div>
        </div>
        <div className="flip-card-back">
          <div className="strip" />
          <div className="mstrip">
            <p className="code">{cardCvv || "•••"}</p>
          </div>
          <div className="sstrip" />
        </div>
      </div>
    </div>
  );
}
