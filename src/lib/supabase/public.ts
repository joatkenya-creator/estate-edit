import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Read-only Supabase client for PUBLIC content (anon key, no cookies). Because
 * it never touches request cookies, pages that use it can still be statically
 * generated / ISR-cached. Row Level Security still applies — only published
 * rows are returned.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
