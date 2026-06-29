"use client";

import { createContext, useContext, useMemo } from "react";
import { regionCurrency, type Region } from "@/lib/region";

type RegionContextValue = {
  region: Region;
  /** Native currency for the active region (KES / USD). */
  currency: "KES" | "USD";
};

const RegionContext = createContext<RegionContextValue | null>(null);

/**
 * Provides the geo-detected region to client components (display only). The
 * region is resolved server-side from the visitor's location (cf-ipcountry) and
 * passed in. There is NO manual switcher — visitors cannot change markets, so a
 * Kenyan visitor only sees the Kenya store and US / other only Virginia.
 */
export function RegionProvider({
  initialRegion,
  children,
}: {
  initialRegion: Region;
  children: React.ReactNode;
}) {
  const value = useMemo<RegionContextValue>(
    () => ({ region: initialRegion, currency: regionCurrency[initialRegion] }),
    [initialRegion],
  );
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within a RegionProvider");
  return ctx;
}
