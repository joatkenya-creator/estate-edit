"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { REGION_COOKIE, regionCurrency, type Region } from "@/lib/region";

type RegionContextValue = {
  region: Region;
  /** Native currency for the active region (KES / USD). */
  currency: "KES" | "USD";
  setRegion: (region: Region) => void;
};

const RegionContext = createContext<RegionContextValue | null>(null);

/**
 * Holds the active region on the client. Initialised from the server-resolved
 * region (cookie / geo) to avoid a flash. Switching writes the cookie and calls
 * router.refresh() so server components (the catalogue) re-render for the new
 * region.
 */
export function RegionProvider({
  initialRegion,
  children,
}: {
  initialRegion: Region;
  children: React.ReactNode;
}) {
  const [region, setRegionState] = useState<Region>(initialRegion);
  const router = useRouter();

  const setRegion = useCallback(
    (next: Region) => {
      if (next === region) return;
      setRegionState(next);
      document.cookie = `${REGION_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      router.refresh();
    },
    [region, router],
  );

  const value = useMemo<RegionContextValue>(
    () => ({ region, currency: regionCurrency[region], setRegion }),
    [region, setRegion],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within a RegionProvider");
  return ctx;
}
