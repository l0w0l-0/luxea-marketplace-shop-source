import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("products")
      .select("id", { head: true, count: "exact" });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      service: "beauty-studio",
      database: "up",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "beauty-studio",
        database: "down",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
