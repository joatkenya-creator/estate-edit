import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Privileged Supabase client using the SERVICE ROLE key. It BYPASSES Row Level
 * Security, so it must only ever run on the server (never import this into a
 * Client Component). Use for admin reads/writes such as listing inquiries or
 * publishing assets.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
