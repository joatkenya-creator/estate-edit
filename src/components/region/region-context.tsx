"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { regionCurrency, type Region } from "@/lib/region";

type RegionContextValue = {
  region: Region;
  /** Native currency for the active region (KES / USD). */
  currency: "KES" | "USD";
};

const RegionContext = createContext<RegionContextValue | null>(null);

/**
 * Provides the active region to client components (the header badge,
 * cart/footer copy — including the footer's "Areas Served" LINKS, which are
 * real crawlable hrefs, not just display text).
 *
 * `initialRegion` is resolved server-side (host-based, see region.server.ts)
 * and passed down from the root layout, which already calls `headers()` for
 * its own metadata — that call is request-memoized by Next, so seeding this
 * provider from it is free and doesn't add a new dynamic-rendering trigger.
 *
 * Previously this defaulted to "kenya" and corrected itself client-side after
 * mount, on the theory that reading headers here was what tripped a Worker
 * CPU-limit error (1102). That default was wrong: it made the Virginia
 * domain's server-rendered footer link to Kenya-only pages like
 * /areas/karen (404 on us.estateedit.org) instead of its own /areas/mclean
 * etc., which Ahrefs flagged as broken links + orphan pages across nearly
 * every page on the Virginia site. The actual dynamic-rendering cost is the
 * root layout's `headers()` call itself (unavoidable for host-based region
 * detection) plus per-request Supabase fetches — the fetches are now cached
 * (see queries.ts), so seeding this from the server is safe.
 */
export function RegionProvider({
  children,
  initialRegion,
}: {
  children: React.ReactNode;
  initialRegion: Region;
}) {
  const [region, setRegion] = useState<Region>(initialRegion);

  // Defensive fallback only (e.g. a cached/static shell served before the
  // server region was known) — normally a no-op since initialRegion is
  // already correct.
  useEffect(() => {
    const fromHost = window.location.hostname.toLowerCase().startsWith("us.")
      ? "virginia"
      : "kenya";
    if (fromHost !== region) setRegion(fromHost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<RegionContextValue>(
    () => ({ region, currency: regionCurrency[region] }),
    [region],
  );
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within a RegionProvider");
  return ctx;
}
