import { NextResponse } from "next/server";
import { getDatabase, nextId, publicUser } from "@/src/backend/store";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  const db = getDatabase();

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Name, email and password are required" },
      { status: 400 },
    );
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existingUser = db.users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return NextResponse.json(
      { message: "This email is already registered" },
      { status: 409 },
    );
  }

  const user = {
    id: nextId("user"),
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    role: "customer" as const,
    tier: "Member" as const,
    points: 0,
  };

  db.users.push(user);

  return NextResponse.json({ user: publicUser(user) }, { status: 201 });
}
