import { getSupabaseServerClient } from "@/src/lib/supabase/server";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: "CUSTOMER" | "ADMIN";
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === "ADMIN" ? "admin" : "customer",
  };
}

export async function findUserByEmail(email: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id,email,name,password_hash,role")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as UserRow | null) ?? null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }) {
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      password_hash: input.passwordHash,
      role: "CUSTOMER",
      created_at: now,
      updated_at: now,
    })
    .select("id,email,name,password_hash,role")
    .single();

  if (error) throw new Error(error.message);
  return data as UserRow;
}
