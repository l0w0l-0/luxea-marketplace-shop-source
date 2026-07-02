import { z } from "zod";

import { ok } from "@/src/lib/api/response";
import { getCart } from "@/src/lib/repositories/carts";
import { listCatalogProducts } from "@/src/lib/repositories/products";

const bootstrapQuerySchema = z.object({
  userId: z.uuid().nullable().optional(),
  sessionId: z.string().min(1).nullable().optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = bootstrapQuerySchema.parse({
    userId: url.searchParams.get("userId"),
    sessionId: url.searchParams.get("sessionId"),
  });

  const [products, cart] = await Promise.all([
    listCatalogProducts(),
    parsed.userId || parsed.sessionId
      ? getCart(parsed)
      : Promise.resolve({
          id: null,
          userId: null,
          sessionId: null,
          items: [],
          summary: {
            quantity: 0,
            subtotal: 0,
            discount: 0,
            shipping: 0,
            total: 0,
          },
        }),
  ]);

  return ok({
    products,
    cart,
    realtime: {
      tables: [
        "products",
        "product_colors",
        "inventory",
        "carts",
        "cart_items",
        "orders",
        "order_items",
        "loyalty",
        "loyalty_transactions",
      ],
    },
  });
}
