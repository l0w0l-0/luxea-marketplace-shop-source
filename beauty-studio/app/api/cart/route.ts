import { z } from "zod";

import { fail, ok } from "@/src/lib/api/response";
import {
  addCartItem,
  getCart,
  setCartItemQuantity,
} from "@/src/lib/repositories/carts";

const uuidLikeSchema = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  "Invalid UUID",
);

const cartOwnerSchema = z
  .object({
    userId: uuidLikeSchema.nullable().optional(),
    sessionId: z.string().min(1).nullable().optional(),
  })
  .refine((value) => value.userId || value.sessionId, {
    message: "userId or sessionId is required",
  });

const addCartItemSchema = cartOwnerSchema.extend({
  productId: uuidLikeSchema,
  colorId: uuidLikeSchema,
  quantity: z.number().int().min(1).max(20).optional(),
});

const setCartQuantitySchema = cartOwnerSchema.extend({
  productId: uuidLikeSchema,
  colorId: uuidLikeSchema,
  quantity: z.number().int().min(0).max(20),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = cartOwnerSchema.safeParse({
    userId: url.searchParams.get("userId"),
    sessionId: url.searchParams.get("sessionId"),
  });

  if (!parsed.success) {
    return fail("INVALID_CART_OWNER", parsed.error.issues[0]?.message ?? "Invalid cart owner", 400);
  }

  const cart = await getCart(parsed.data);
  return ok({ cart });
}

export async function POST(request: Request) {
  const parsed = addCartItemSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("INVALID_CART_PAYLOAD", parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  try {
    const cart = await addCartItem(parsed.data);
    return ok({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add cart item";
    const status =
      message === "Insufficient inventory" ? 409 : message.endsWith("not found") ? 404 : 400;
    return fail("CART_ADD_FAILED", message, status);
  }
}

export async function PATCH(request: Request) {
  const parsed = setCartQuantitySchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("INVALID_CART_PAYLOAD", parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  try {
    const cart = await setCartItemQuantity(parsed.data);
    return ok({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update cart item";
    const status =
      message === "Insufficient inventory" ? 409 : message.endsWith("not found") ? 404 : 400;
    return fail("CART_UPDATE_FAILED", message, status);
  }
}
