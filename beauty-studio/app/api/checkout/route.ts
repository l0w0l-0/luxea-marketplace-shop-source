import { fail, ok } from "@/src/lib/api/response";
import { createOrder } from "@/src/lib/repositories/orders";

type CheckoutItem = {
  productId: string;
  colorId?: string | null;
  quantity: number;
};

export async function POST(request: Request) {
  const { userId, items, paymentMethod } = await request.json();

  if (!userId) {
    return fail("UNAUTHORIZED", "Please login before checkout", 401);
  }

  if (!Array.isArray(items) || items.length === 0) {
    return fail("EMPTY_CART", "Cart is empty", 400);
  }

  try {
    const order = await createOrder({
      userId,
      items: items as CheckoutItem[],
      paymentMethod: String(paymentMethod || "Credit Card"),
    });

    return ok({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    const status = message.includes("not found") ? 404 : 409;
    return fail("CHECKOUT_FAILED", message, status);
  }
}
