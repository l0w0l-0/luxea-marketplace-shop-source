export const COMMERCE_CONFIG = {
  freeShippingThreshold: 699,
  shippingFee: 50,
  loyaltyPointUnitBaht: 100,
  lowStockThreshold: 10,
} as const;

export type CartPricingLine = {
  unitPrice: number;
  quantity: number;
};

export function calculateAvailableQuantity(
  stockQty: number,
  reservedQty: number = 0,
) {
  return Math.max(0, Math.floor(stockQty) - Math.floor(reservedQty));
}

export function isLowStock(
  stockQty: number,
  lowStockThreshold: number = COMMERCE_CONFIG.lowStockThreshold,
) {
  return Math.floor(stockQty) <= Math.max(0, Math.floor(lowStockThreshold));
}

export function calculateCartTotals(args: {
  items: CartPricingLine[];
  discount?: number;
  freeShippingThreshold?: number;
  shippingFee?: number;
}) {
  const subtotal = args.items.reduce((sum, item) => {
    const quantity = Math.max(0, Math.floor(item.quantity));
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    return sum + unitPrice * quantity;
  }, 0);

  const itemCount = args.items.reduce(
    (sum, item) => sum + Math.max(0, Math.floor(item.quantity)),
    0,
  );
  const discount = Math.max(0, Math.floor(args.discount ?? 0));
  const freeShippingThreshold =
    args.freeShippingThreshold ?? COMMERCE_CONFIG.freeShippingThreshold;
  const shippingFee = args.shippingFee ?? COMMERCE_CONFIG.shippingFee;
  const shipping =
    itemCount === 0
      ? 0
      : subtotal >= freeShippingThreshold
        ? 0
        : Math.max(0, Math.floor(shippingFee));

  return {
    itemCount,
    subtotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount) + shipping,
  };
}

export function calculateLoyaltyPoints(
  orderTotal: number,
  loyaltyPointUnitBaht: number = COMMERCE_CONFIG.loyaltyPointUnitBaht,
) {
  const unit = Math.max(1, Math.floor(loyaltyPointUnitBaht));
  return Math.floor(Math.max(0, Number(orderTotal) || 0) / unit);
}

// --- Formatting Utilities ---

export function formatMoney(amount: number) {
  return `฿${amount.toLocaleString("th-TH")}`;
}

export function formatOrderStatus(
  status:
    | "paid"
    | "waiting_payment"
    | "cod"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled",
) {
  if (status === "waiting_payment") return "รอชำระ";
  if (status === "paid") return "ชำระแล้ว";
  if (status === "cod") return "ปลายทาง";
  if (status === "processing") return "กำลังเตรียมของ";
  if (status === "shipped") return "จัดส่งแล้ว";
  if (status === "completed") return "สำเร็จ";
  return "ยกเลิก";
}

// --- Image Utilities ---

export function normalizeImageUrl(url: string) {
  if (!url) return url;
  return url.replaceAll("text-to-image", "text_to_image");
}

export function getImageSrc(url: string) {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return normalized;
  if (normalized.startsWith("/")) return normalized;
  if (!/^https?:\/\//.test(normalized)) return normalized;
  return `/api/image?url=${encodeURIComponent(normalized)}`;
}

// --- File Download Utility ---

export function downloadTextFile(
  filename: string,
  content: string,
  mime: string,
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- HTML Escaping Utility ---

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
