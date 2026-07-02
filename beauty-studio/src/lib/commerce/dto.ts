export type CommerceProductColorDto = {
  id: string;
  name: string;
  hex: string;
  undertone?: string;
  finish?: string;
  coverage?: string;
  stock: number;
};

export type CommerceProductDto = {
  id: string;
  name: string;
  category: string;
  shade: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  color: string;
  description: string;
  image: string;
  colors: CommerceProductColorDto[];
  isPremium?: boolean;
  status?: "draft" | "published";
  tags?: Array<"Premium" | "New" | "Best Seller">;
  sortOrder?: number;
};

export type CommerceCartItemDto = {
  productId: string;
  colorId: string;
  quantity: number;
  unitPrice: number;
  name: string;
  colorName: string;
  image: string;
};

export type CommerceCartDto = {
  id: string | null;
  userId: string | null;
  sessionId: string | null;
  items: CommerceCartItemDto[];
  summary: {
    quantity: number;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
};
