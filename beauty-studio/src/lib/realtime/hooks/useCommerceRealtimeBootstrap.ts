"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  CommerceCartDto,
  CommerceProductDto,
} from "@/src/lib/commerce/dto";
import {
  REALTIME_TABLES,
  subscribeToTableChanges,
} from "@/src/lib/realtime/core";

type BootstrapState = {
  products: CommerceProductDto[];
  cart: CommerceCartDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

type BootstrapResponse = {
  data: {
    products: CommerceProductDto[];
    cart: CommerceCartDto;
  };
};

export function useCommerceRealtimeBootstrap(args: {
  userId?: string | null;
  sessionId?: string | null;
}): BootstrapState {
  const [products, setProducts] = useState<CommerceProductDto[]>([]);
  const [cart, setCart] = useState<CommerceCartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (args.userId) {
      params.set("userId", args.userId);
    }
    if (args.sessionId) {
      params.set("sessionId", args.sessionId);
    }
    return params.toString();
  }, [args.sessionId, args.userId]);

  async function refresh() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/bootstrap${queryString ? `?${queryString}` : ""}`,
        {
          cache: "no-store",
        },
      );
      const payload = (await response.json()) as BootstrapResponse;

      setProducts(payload.data.products);
      setCart(payload.data.cart);
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to load bootstrap data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [queryString]);

  useEffect(() => {
    const unsubscribers = [
      subscribeToTableChanges({
        channelName: "commerce-products",
        table: REALTIME_TABLES.products,
        onChange: () => {
          void refresh();
        },
      }),
      subscribeToTableChanges({
        channelName: "commerce-product-colors",
        table: REALTIME_TABLES.productColors,
        onChange: () => {
          void refresh();
        },
      }),
      subscribeToTableChanges({
        channelName: "commerce-inventory",
        table: REALTIME_TABLES.inventory,
        onChange: () => {
          void refresh();
        },
      }),
      subscribeToTableChanges({
        channelName: "commerce-cart-items",
        table: REALTIME_TABLES.cartItems,
        onChange: () => {
          void refresh();
        },
      }),
    ];

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [queryString]);

  return {
    products,
    cart,
    loading,
    error,
    refresh,
  };
}
