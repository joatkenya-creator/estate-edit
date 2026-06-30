"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { regionCurrency, regionFromCountry, type Region } from "@/lib/region";

type RegionContextValue = {
  region: Region;
  /** Native currency for the active region (KES / USD). */
  currency: "KES" | "USD";
};

const RegionContext = createContext<RegionContextValue | null>(null);

/**
 * Provides the geo-detected region to client components (DISPLAY ONLY — the
 * header badge + cart copy). Detection runs on the CLIENT via Cloudflare's
 * /cdn-cgi/trace, deliberately NOT in the server layout: reading request geo
 * (headers/cf) there forced every page into dynamic SSR and tripped Worker
 * CPU limits (error 1102). The catalogue itself is still region-filtered
 * server-side in the data layer (getRegion), so the content stays correct.
 */
export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = useState<Region>("kenya");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const text = await fetch("/cdn-cgi/trace", { cache: "no-store" }).then((r) => r.text());
        const country = text.match(/loc=([A-Z]{2})/)?.[1] ?? null;
        if (!cancelled) setRegion(regionFromCountry(country));
      } catch {
        /* keep the default */
      }
    })();
    return () => {
      cancelled = true;
    };
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
