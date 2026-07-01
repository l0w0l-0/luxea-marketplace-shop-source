import { NextResponse } from "next/server";
import { getDatabase, publicUser } from "@/src/backend/store";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const db = getDatabase();
  const normalizedEmail = String(email ?? "").toLowerCase().trim();
  const user = db.users.find(
    (item) => item.email === normalizedEmail && item.password === password,
  );

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 },
    );
  }

  return NextResponse.json({ user: publicUser(user) });
}
