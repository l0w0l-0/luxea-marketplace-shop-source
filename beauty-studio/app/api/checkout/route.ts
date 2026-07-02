import { NextResponse } from "next/server";
import { getDatabase, nextId, Order } from "@/src/backend/store";
import { calculateCartTotals, calculateLoyaltyPoints } from "@/src/shared/commerce";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

export async function POST(request: Request) {
  const { userId, items, paymentMethod } = await request.json();
  const db = getDatabase();
  const user = db.users.find((item) => item.id === userId);

  if (!user) {
    return NextResponse.json(
      { message: "Please login before checkout" },
      { status: 401 },
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { message: "Cart is empty" },
      { status: 400 },
    );
  }

  const orderItems: Order["items"] = [];

  for (const item of items as CheckoutItem[]) {
    const product = db.products.find((entry) => entry.id === item.productId);
    const quantity = Math.max(1, Math.floor(Number(item.quantity)));

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: `${product.name} has only ${product.stock} left` },
        { status: 409 },
      );
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity,
      price: product.price,
    });
  }

  for (const item of orderItems) {
    const product = db.products.find((entry) => entry.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  }

  const totals = calculateCartTotals({
    items: orderItems.map((item) => ({
      unitPrice: item.price,
      quantity: item.quantity,
    })),
  });
  const subtotal = totals.subtotal;
  const shippingFee = totals.shipping;
  const total = totals.total;
  const status =
    paymentMethod === "Bank Transfer"
      ? "waiting_payment"
      : paymentMethod === "Cash On Delivery"
        ? "cod"
        : "paid";
  const order: Order = {
    id: nextId("order"),
    userId: user.id,
    customerName: user.name,
    items: orderItems,
    subtotal,
    shippingFee,
    total,
    paymentMethod: String(paymentMethod || "Credit Card"),
    status,
    createdAt: new Date().toISOString(),
  };

  user.points += calculateLoyaltyPoints(total);
  if (user.points >= 1000) {
    user.tier = "VIP";
  }

  db.orders.unshift(order);

  return NextResponse.json({ order, products: db.products });
}
