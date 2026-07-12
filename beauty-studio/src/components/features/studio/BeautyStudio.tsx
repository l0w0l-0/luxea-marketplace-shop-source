"use client";

import { useState } from "react";

export function BeautyStudio() {
  const [makeup, setMakeup] = useState({
    lipstick: "#D96483",
    blush: "#E8B4B8",
    highlighter: "#D7B9AE",
    foundation: "#E3C8BC",
  });

  const makeupOptions = [
    {
      name: "Lipstick",
      key: "lipstick" as const,
      colors: ["#D96483", "#E2583E", "#7A283D", "#B84A6C"],
    },
    {
      name: "Blush",
      key: "blush" as const,
      colors: ["#E8B4B8", "#F2A284", "#D88C9A"],
    },
    {
      name: "Highlighter",
      key: "highlighter" as const,
      colors: ["#D7B9AE", "#E2A49A", "#F1D2C5"],
    },
    {
      name: "Foundation",
      key: "foundation" as const,
      colors: ["#F5E1D3", "#E3C8BC", "#CEB2A6"],
    },
  ];

  return (
    <section className="glass-xl p-8">
      <h2 className="text-3xl font-display text-[var(--color-primary)] mb-8">
        💄 LUXEA Beauty Studio
      </h2>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: Preview */}
        <div className="bg-white rounded-[var(--radius-2xl)] p-8 flex items-center justify-center">
          <div className="relative w-full max-w-md h-80 bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-accent-100)] rounded-[var(--radius-2xl)] flex items-center justify-center">
            <span className="text-9xl">💄</span>
          </div>
        </div>
        {/* Right: Controls */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[var(--color-text)]">
            เลือกสีเครื่องสำอาง
          </h3>
          {makeupOptions.map((option) => (
            <div key={option.name} className="glass p-5">
              <h4 className="font-bold mb-3 text-[var(--color-primary)]">
                {option.name}
              </h4>
              <div className="flex gap-3 flex-wrap">
                {option.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setMakeup((prev) => ({ ...prev, [option.key]: color }))
                    }
                    className={`color-dot ${makeup[option.key] === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-3">
            <button className="btn btn-primary w-full">Save This Look</button>
            <button className="btn btn-secondary w-full">Buy The Look</button>
          </div>
        </div>
      </div>
    </section>
  );
}
