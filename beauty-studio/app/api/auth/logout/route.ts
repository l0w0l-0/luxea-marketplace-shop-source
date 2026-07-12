import { ok } from "@/src/lib/api/response";
import { clearSession } from "@/src/lib/auth/session";

export async function POST() {
  await clearSession();
  return ok({ success: true });
}
