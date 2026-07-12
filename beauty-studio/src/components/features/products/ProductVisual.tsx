"use client";

import type { Product } from "@/src/types";
import { getImageSrc } from "@/src/utils";

export function ProductVisual({ product }: { product: Product }) {
  return (
    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-neutral)]">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: product.color }}
      />
      <img
        src={getImageSrc(product.image)}
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
    </div>
  );
}

