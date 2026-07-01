import { NextResponse } from "next/server";
import { getDatabase } from "@/src/backend/store";

export async function GET(request: Request) {
  const db = getDatabase();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const orders = userId
    ? db.orders.filter((order) => order.userId === userId)
    : db.orders;

  return NextResponse.json({ orders });
}
