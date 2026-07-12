import { getSupabaseServerClient } from "@/src/lib/supabase/server";
import { calculateCartTotals, calculateLoyaltyPoints } from "@/src/shared/commerce";

type CheckoutItemInput = {
  productId: string;
  colorId?: string | null;
  quantity: number;
};

type CreateOrderInput = {
  userId: string;
  items: CheckoutItemInput[];
  paymentMethod: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  subtotal: number | string;
  shipping_fee: number | string;
  discount: number | string;
  total: number | string;
  payment_method: string;
  created_at: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string;
  color_id: string | null;
  quantity: number;
  unit_price: number | string;
};

type ProductRow = {
  id: string;
  name: string;
  base_price: number | string;
  is_active: boolean;
};

type InventoryRow = {
  id: string;
  product_id: string;
  color_id: string | null;
  stock_qty: number;
  reserved_qty: number;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  "Credit Card": "CREDIT_CARD",
  "Debit Card": "DEBIT_CARD",
  PromptPay: "PROMPTPAY",
  Wallet: "WALLET",
};

function toDbPaymentMethod(method: string) {
  return PAYMENT_METHOD_MAP[method] ?? "CREDIT_CARD";
}

async function mapOrder(order: OrderRow, items: OrderItemRow[], productNames: Map<string, string>) {
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    subtotal: toNumber(order.subtotal),
    shippingFee: toNumber(order.shipping_fee),
    discount: toNumber(order.discount),
    total: toNumber(order.total),
    paymentMethod: order.payment_method,
    createdAt: order.created_at,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        productId: item.product_id,
        colorId: item.color_id,
        quantity: item.quantity,
        price: toNumber(item.unit_price),
        name: productNames.get(item.product_id) ?? "Unknown Product",
      })),
  };
}

export async function listOrders(userId?: string | null) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select("id,user_id,status,subtotal,shipping_fee,discount,total,payment_method,created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: orderRows, error } = await query;
  if (error) throw new Error(error.message);

  const orders = (orderRows ?? []) as OrderRow[];
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  const { data: itemRows, error: itemError } = await supabase
    .from("order_items")
    .select("order_id,product_id,color_id,quantity,unit_price")
    .in("order_id", orderIds);

  if (itemError) throw new Error(itemError.message);

  const items = (itemRows ?? []) as OrderItemRow[];
  const productIds = Array.from(new Set(items.map((item) => item.product_id)));
  const { data: productRows, error: productError } = productIds.length
    ? await supabase.from("products").select("id,name").in("id", productIds)
    : { data: [], error: null };

  if (productError) throw new Error(productError.message);

  const productNames = new Map(
    ((productRows ?? []) as Array<{ id: string; name: string }>).map((row) => [row.id, row.name]),
  );

  return Promise.all(orders.map((order) => mapOrder(order, items, productNames)));
}

/**
 * Creates an order, decrementing inventory for each line item.
 * Note: Supabase-js has no multi-statement transactions, so this mirrors
 * the sequential-write pattern already used in src/lib/repositories/carts.ts.
 * If a step fails partway through, earlier inventory decrements are not
 * rolled back automatically — acceptable for now given the rest of the
 * codebase follows the same non-transactional pattern.
 */
export async function createOrder(input: CreateOrderInput) {
  const supabase = getSupabaseServerClient();

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const productIds = Array.from(new Set(input.items.map((item) => item.productId)));
  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("id,name,base_price,is_active")
    .in("id", productIds)
    .is("deleted_at", null);

  if (productError) throw new Error(productError.message);

  const products = new Map(
    ((productRows ?? []) as ProductRow[]).map((row) => [row.id, row]),
  );

  const lineItems: Array<{
    productId: string;
    colorId: string | null;
    quantity: number;
    unitPrice: number;
    name: string;
  }> = [];

  for (const item of input.items) {
    const product = products.get(item.productId);
    const quantity = Math.max(1, Math.floor(Number(item.quantity)));

    if (!product || !product.is_active) {
      throw new Error("Product not found");
    }

    const { data: inventoryRow, error: inventoryError } = await supabase
      .from("inventory")
      .select("id,product_id,color_id,stock_qty,reserved_qty")
      .eq("product_id", item.productId)
      .eq("color_id", item.colorId ?? null)
      .is("deleted_at", null)
      .maybeSingle();

    if (inventoryError) throw new Error(inventoryError.message);

    const inventory = inventoryRow as InventoryRow | null;
    const available = Math.max(0, (inventory?.stock_qty ?? 0) - (inventory?.reserved_qty ?? 0));

    if (!inventory || available < quantity) {
      throw new Error(`${product.name} has only ${available} left`);
    }

    lineItems.push({
      productId: item.productId,
      colorId: item.colorId ?? null,
      quantity,
      unitPrice: toNumber(product.base_price),
      name: product.name,
    });
  }

  // Decrement stock for each line item now that all items passed validation.
  for (const item of lineItems) {
    const { data: inventoryRow, error: inventoryError } = await supabase
      .from("inventory")
      .select("id,stock_qty")
      .eq("product_id", item.productId)
      .eq("color_id", item.colorId ?? null)
      .is("deleted_at", null)
      .maybeSingle();

    if (inventoryError) throw new Error(inventoryError.message);
    const inventory = inventoryRow as { id: string; stock_qty: number } | null;
    if (!inventory) throw new Error(`${item.name} inventory not found`);

    const { error: updateError } = await supabase
      .from("inventory")
      .update({
        stock_qty: Math.max(0, inventory.stock_qty - item.quantity),
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventory.id);

    if (updateError) throw new Error(updateError.message);
  }

  const totals = calculateCartTotals({
    items: lineItems.map((item) => ({ unitPrice: item.unitPrice, quantity: item.quantity })),
  });

  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      user_id: input.userId,
      status: "PAID",
      subtotal: totals.subtotal,
      shipping_fee: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      payment_method: toDbPaymentMethod(input.paymentMethod),
      created_at: now,
      updated_at: now,
    })
    .select("id,user_id,status,subtotal,shipping_fee,discount,total,payment_method,created_at")
    .single();

  if (orderError) throw new Error(orderError.message);

  const { error: itemsError } = await supabase.from("order_items").insert(
    lineItems.map((item) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: item.productId,
      color_id: item.colorId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      created_at: now,
      updated_at: now,
    })),
  );

  if (itemsError) throw new Error(itemsError.message);

  const pointsEarned = calculateLoyaltyPoints(totals.total);
  const { data: loyaltyRow } = await supabase
    .from("loyalty")
    .select("id,points_balance")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (loyaltyRow) {
    await supabase
      .from("loyalty")
      .update({
        points_balance: (loyaltyRow as { points_balance: number }).points_balance + pointsEarned,
        updated_at: now,
      })
      .eq("id", (loyaltyRow as { id: string }).id);
  } else {
    await supabase.from("loyalty").insert({
      id: crypto.randomUUID(),
      user_id: input.userId,
      points_balance: pointsEarned,
      created_at: now,
      updated_at: now,
    });
  }

  await supabase.from("loyalty_transactions").insert({
    id: crypto.randomUUID(),
    user_id: input.userId,
    order_id: orderId,
    points_change: pointsEarned,
    reason: "PURCHASE",
    created_at: now,
    updated_at: now,
  });

  const order = orderRow as OrderRow;
  const productNames = new Map(lineItems.map((item) => [item.productId, item.name]));
  return mapOrder(
    order,
    lineItems.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      color_id: item.colorId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
    productNames,
  );
}
