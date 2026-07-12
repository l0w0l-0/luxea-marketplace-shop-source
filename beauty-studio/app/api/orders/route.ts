import { fail, ok } from "@/src/lib/api/response";
import { listOrders } from "@/src/lib/repositories/orders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    const orders = await listOrders(userId);
    return ok({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load orders";
    return fail("ORDERS_FAILED", message, 500);
  }
}
