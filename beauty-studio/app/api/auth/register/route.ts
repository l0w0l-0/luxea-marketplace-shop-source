import { fail, ok } from "@/src/lib/api/response";
import { hashPassword } from "@/src/lib/auth/password";
import { createSession } from "@/src/lib/auth/session";
import { createUser, findUserByEmail, toPublicUser } from "@/src/lib/repositories/users";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return fail("MISSING_FIELDS", "Name, email and password are required", 400);
  }

  if (String(password).length < 8) {
    return fail("WEAK_PASSWORD", "Password must be at least 8 characters", 400);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return fail("EMAIL_TAKEN", "This email is already registered", 409);
  }

  const passwordHash = await hashPassword(String(password));
  const user = await createUser({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
  });

  await createSession({
    userId: user.id,
    role: user.role === "ADMIN" ? "admin" : "customer",
  });

  return ok({ user: toPublicUser(user) }, { status: 201 });
}
