"use client";

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/src/lib/supabase/browser";

export const REALTIME_TABLES = {
  products: "products",
  productColors: "product_colors",
  inventory: "inventory",
  carts: "carts",
  cartItems: "cart_items",
  orders: "orders",
  orderItems: "order_items",
  loyalty: "loyalty",
  loyaltyTransactions: "loyalty_transactions",
} as const;

export type RealtimeTableName =
  (typeof REALTIME_TABLES)[keyof typeof REALTIME_TABLES];

type SubscribeTableChangesArgs = {
  channelName: string;
  table: RealtimeTableName;
  filter?: string;
  schema?: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  client?: SupabaseClient;
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
};

export function subscribeToTableChanges({
  channelName,
  table,
  filter,
  schema = "public",
  event = "*",
  client = getSupabaseBrowserClient(),
  onChange,
}: SubscribeTableChangesArgs) {
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event,
        schema,
        table,
        ...(filter ? { filter } : {}),
      },
      onChange,
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function removeRealtimeChannel(
  channel: RealtimeChannel,
  client = getSupabaseBrowserClient(),
) {
  return client.removeChannel(channel);
}
