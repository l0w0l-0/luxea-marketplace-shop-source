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
