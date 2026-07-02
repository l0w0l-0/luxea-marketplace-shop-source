import { getCatalogImageUrl } from "@/src/lib/catalog/images";
import type { CommerceProductDto } from "@/src/lib/commerce/dto";
import { getSupabaseServerClient } from "@/src/lib/supabase/server";
import { calculateAvailableQuantity } from "@/src/shared/commerce";

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

type ProductRow = {
  id: string;
  name: string;
  category: string;
  base_price: number | string;
  description: string;
  avg_rating: number | string | null;
  review_count: number;
  is_active: boolean;
  product_colors: Array<{
    id: string;
    color_name: string;
    hex: string;
    undertone: string;
    finish: string;
    coverage: string;
    deleted_at: string | null;
  }> | null;
  inventory: Array<{
    id: string;
    color_id: string | null;
    stock_qty: number;
    reserved_qty: number;
    deleted_at: string | null;
  }> | null;
};

function mapProduct(record: ProductRow): CommerceProductDto {
  const colors = (record.product_colors ?? [])
    .filter((color) => color.deleted_at === null)
    .map((color) => {
      const inventory = (record.inventory ?? []).find(
        (item) => item.deleted_at === null && item.color_id === color.id,
      );

      return {
        id: color.id,
        name: color.color_name,
        hex: color.hex,
        undertone: formatEnumLabel(color.undertone),
        finish: formatEnumLabel(color.finish),
        coverage: formatEnumLabel(color.coverage),
        stock: calculateAvailableQuantity(
          inventory?.stock_qty ?? 0,
          inventory?.reserved_qty ?? 0,
        ),
      };
    });

  const totalStock = (record.inventory ?? [])
    .filter((item) => item.deleted_at === null)
    .reduce(
      (sum, item) =>
        sum + calculateAvailableQuantity(item.stock_qty, item.reserved_qty),
      0,
    );
  const primaryColor = colors[0];

  return {
    id: record.id,
    name: record.name,
    category: formatEnumLabel(record.category),
    shade: primaryColor?.name ?? "Signature Shade",
    price: toNumber(record.base_price),
    stock: totalStock,
    rating: toNumber(record.avg_rating),
    reviewCount: record.review_count,
    color: primaryColor?.hex ?? "#A35D6A",
    description: record.description,
    image: getCatalogImageUrl({
      productName: record.name,
      category: formatEnumLabel(record.category),
      accent: primaryColor?.name,
    }),
    colors,
    isPremium: toNumber(record.base_price) >= 500,
    status: record.is_active ? "published" : "draft",
    tags: [
      ...(toNumber(record.base_price) >= 500 ? (["Premium"] as const) : []),
      ...(record.review_count >= 100 ? (["Best Seller"] as const) : []),
    ],
  };
}

export async function listCatalogProducts() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("products").select(`
      id,
      name,
      category,
      base_price,
      description,
      avg_rating,
      review_count,
      is_active,
      product_colors (
        id,
        color_name,
        hex,
        undertone,
        finish,
        coverage,
        deleted_at
      ),
      inventory (
        id,
        color_id,
        stock_qty,
        reserved_qty,
        deleted_at
      )
    `)
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ProductRow[]).map(mapProduct);
}
