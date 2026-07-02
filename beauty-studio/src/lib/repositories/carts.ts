import type { CommerceCartDto } from "@/src/lib/commerce/dto";
import { getCatalogImageUrl } from "@/src/lib/catalog/images";
import { getSupabaseServerClient } from "@/src/lib/supabase/server";
import { calculateCartTotals } from "@/src/shared/commerce";

type CartOwnerInput = {
  userId?: string | null;
  sessionId?: string | null;
};

type CartMutationInput = CartOwnerInput & {
  productId: string;
  colorId: string;
  quantity?: number;
};

type InventoryLockRow = {
  id: string;
  stock_qty: number | null;
  reserved_qty: number | null;
};

type CartRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
};

type CartItemRow = {
  id: string;
  product_id: string;
  color_id: string | null;
  quantity: number;
  unit_price: number | string;
};

type ProductLookupRow = {
  id: string;
  name: string;
  category: string;
};

type ColorLookupRow = {
  id: string;
  color_name: string;
};

function decimalToNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

async function findActiveCart(owner: CartOwnerInput) {
  if (!owner.userId && !owner.sessionId) {
    throw new Error("Cart owner is required");
  }

  const supabase = getSupabaseServerClient();
  const ownerWhere = owner.userId
    ? supabase
        .from("carts")
        .select("id,user_id,session_id")
        .eq("user_id", owner.userId)
    : supabase
        .from("carts")
        .select("id,user_id,session_id")
        .eq("session_id", owner.sessionId ?? "");

  const { data, error } = await ownerWhere
    .eq("status", "ACTIVE")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CartRow | null) ?? null;
}

async function ensureActiveCart(owner: CartOwnerInput) {
  const existing = await findActiveCart(owner);
  if (existing) {
    return existing;
  }

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("carts")
    .insert({
      id: crypto.randomUUID(),
      user_id: owner.userId ?? null,
      session_id: owner.sessionId ?? null,
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    })
    .select("id,user_id,session_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CartRow;
}

async function getCartItems(cartId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("id,product_id,color_id,quantity,unit_price")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CartItemRow[];
}

async function mapCart(cart: CartRow | null): Promise<CommerceCartDto> {
  if (!cart) {
    return {
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
    };
  }

  const supabase = getSupabaseServerClient();
  const cartItems = await getCartItems(cart.id);
  const productIds = Array.from(new Set(cartItems.map((item) => item.product_id)));
  const colorIds = Array.from(
    new Set(
      cartItems
        .map((item) => item.color_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const [{ data: productRows, error: productError }, { data: colorRows, error: colorError }] =
    await Promise.all([
      productIds.length > 0
        ? supabase
            .from("products")
            .select("id,name,category")
            .in("id", productIds)
        : Promise.resolve({ data: [], error: null }),
      colorIds.length > 0
        ? supabase
            .from("product_colors")
            .select("id,color_name")
            .in("id", colorIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (productError) {
    throw new Error(productError.message);
  }

  if (colorError) {
    throw new Error(colorError.message);
  }

  const productsById = new Map(
    ((productRows ?? []) as ProductLookupRow[]).map((row) => [row.id, row]),
  );
  const colorsById = new Map(
    ((colorRows ?? []) as ColorLookupRow[]).map((row) => [row.id, row]),
  );
  const items = cartItems.map((item) => {
    const product = productsById.get(item.product_id);
    const color = item.color_id ? colorsById.get(item.color_id) : null;

    return {
      productId: item.product_id,
      colorId: item.color_id ?? "",
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unit_price),
      name: product?.name ?? "Unknown Product",
      colorName: color?.color_name ?? "Default",
      image: getCatalogImageUrl({
        productName: product?.name ?? "Beauty Product",
        category: product?.category ?? "Beauty",
        accent: color?.color_name,
      }),
    };
  });
  const totals = calculateCartTotals({
    items: items.map((item) => ({
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  });

  return {
    id: cart.id,
    userId: cart.user_id,
    sessionId: cart.session_id,
    items,
    summary: {
      quantity: totals.itemCount,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
    },
  };
}

async function lockInventoryRow(
  productId: string,
  colorId: string,
) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("id,stock_qty,reserved_qty")
    .eq("product_id", productId)
    .eq("color_id", colorId)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as InventoryLockRow | null) ?? null;
}

export async function getCart(owner: CartOwnerInput) {
  const cart = await findActiveCart(owner);
  return mapCart(cart);
}

export async function addCartItem(input: CartMutationInput) {
  const supabase = getSupabaseServerClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,name,base_price,is_active")
    .eq("id", input.productId)
    .is("deleted_at", null)
    .eq("is_active", true)
    .maybeSingle();

  if (productError) {
    throw new Error(productError.message);
  }

  if (!product) {
    throw new Error("Product not found");
  }

  const { data: color, error: colorError } = await supabase
    .from("product_colors")
    .select("id")
    .eq("id", input.colorId)
    .eq("product_id", input.productId)
    .is("deleted_at", null)
    .maybeSingle();

  if (colorError) {
    throw new Error(colorError.message);
  }

  if (!color) {
    throw new Error("Color not found");
  }

  const cart = await ensureActiveCart(input);
  const existingItems = await getCartItems(cart.id);
  const existingItem = existingItems.find(
    (item) => item.product_id === input.productId && item.color_id === input.colorId,
  );
  const incrementBy = Math.max(1, Math.floor(input.quantity ?? 1));
  const inventoryRow = await lockInventoryRow(input.productId, input.colorId);

  if (!inventoryRow) {
    throw new Error("Inventory not found");
  }

  const available =
    Math.max(0, inventoryRow.stock_qty ?? 0) -
    Math.max(0, inventoryRow.reserved_qty ?? 0);
  if (available < incrementBy) {
    throw new Error("Insufficient inventory");
  }

  const { error: inventoryError } = await supabase
    .from("inventory")
    .update({
      reserved_qty: Math.max(0, inventoryRow.reserved_qty ?? 0) + incrementBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inventoryRow.id);

  if (inventoryError) {
    throw new Error(inventoryError.message);
  }

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + incrementBy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingItem.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const now = new Date().toISOString();
    const { error } = await supabase.from("cart_items").insert({
      id: crypto.randomUUID(),
      cart_id: cart.id,
      product_id: input.productId,
      color_id: input.colorId,
      quantity: incrementBy,
      unit_price: decimalToNumber(product.base_price),
      created_at: now,
      updated_at: now,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  return getCart(input);
}

export async function setCartItemQuantity(input: CartMutationInput & { quantity: number }) {
  const supabase = getSupabaseServerClient();
  const cart = await ensureActiveCart(input);
  const existingItems = await getCartItems(cart.id);
  const existingItem = existingItems.find(
    (item) => item.product_id === input.productId && item.color_id === input.colorId,
  );

  if (!existingItem) {
    throw new Error("Cart item not found");
  }

  const nextQuantity = Math.max(0, Math.floor(input.quantity));
  const delta = nextQuantity - existingItem.quantity;
  const inventoryRow = await lockInventoryRow(input.productId, input.colorId);

  if (!inventoryRow) {
    throw new Error("Inventory not found");
  }

  if (delta > 0) {
    const available =
      Math.max(0, inventoryRow.stock_qty ?? 0) -
      Math.max(0, inventoryRow.reserved_qty ?? 0);
    if (available < delta) {
      throw new Error("Insufficient inventory");
    }
  }

  const reservedQty = Math.max(0, inventoryRow.reserved_qty ?? 0);
  const nextReservedQty =
    delta > 0 ? reservedQty + delta : delta < 0 ? reservedQty - Math.abs(delta) : reservedQty;
  const { error: inventoryError } = await supabase
    .from("inventory")
    .update({
      reserved_qty: Math.max(0, nextReservedQty),
      updated_at: new Date().toISOString(),
    })
    .eq("id", inventoryRow.id);

  if (inventoryError) {
    throw new Error(inventoryError.message);
  }

  if (nextQuantity === 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", existingItem.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: nextQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingItem.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  return getCart(input);
}
