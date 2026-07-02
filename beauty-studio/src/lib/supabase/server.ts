import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/src/lib/env/server";

export function getSupabaseServerClient() {
  return createClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    },
  );
}
