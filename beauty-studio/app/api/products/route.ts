import { ok } from "@/src/lib/api/response";
import { listCatalogProducts } from "@/src/lib/repositories/products";

export async function GET() {
  const products = await listCatalogProducts();
  return ok({ products });
}
