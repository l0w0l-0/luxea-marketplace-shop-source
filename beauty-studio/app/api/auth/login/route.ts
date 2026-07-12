import { fail, ok } from "@/src/lib/api/response";
import { verifyPassword } from "@/src/lib/auth/password";
import { createSession } from "@/src/lib/auth/session";
import { findUserByEmail, toPublicUser } from "@/src/lib/repositories/users";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const normalizedEmail = String(email ?? "").toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);
  const passwordMatches = user ? await verifyPassword(String(password ?? ""), user.password_hash) : false;

  if (!user || !passwordMatches) {
    return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  await createSession({
    userId: user.id,
    role: user.role === "ADMIN" ? "admin" : "customer",
  });

  return ok({ user: toPublicUser(user) });
}
