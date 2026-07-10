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
 * Provides the active region to client components (DISPLAY ONLY — the header
 * badge, cart/footer copy). Region is derived from the HOST (us.* -> Virginia),
 * matching the server resolver in region.server.ts, so the whole app agrees.
 *
 * We read the host on the CLIENT (not the server layout) on purpose: reading
 * request headers in the layout forced every page into dynamic SSR and tripped
 * Worker CPU limits (error 1102). Initial state is "kenya" (matches SSR HTML,
 * so no hydration mismatch); on the us. subdomain it flips to "virginia" after
 * mount — a brief, cosmetic badge flip on the secondary market only.
 */
export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = useState<Region>("kenya");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hostname.toLowerCase().startsWith("us.")
    ) {
      setRegion("virginia");
    }
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
