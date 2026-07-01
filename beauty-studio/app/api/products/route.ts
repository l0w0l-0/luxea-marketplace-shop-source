import { NextResponse } from "next/server";
import { getDatabase } from "@/src/backend/store";

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({ products: db.products });
}

export async function PATCH(request: Request) {
  const { id, stock, price } = await request.json();
  const db = getDatabase();
  const product = db.products.find((item) => item.id === id);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (typeof stock === "number") {
    product.stock = Math.max(0, Math.floor(stock));
  }

  if (typeof price === "number") {
    product.price = Math.max(0, Math.floor(price));
  }

  return NextResponse.json({ product });
}
