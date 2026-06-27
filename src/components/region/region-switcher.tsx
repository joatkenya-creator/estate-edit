"use client";

import { cn } from "@/lib/utils";
import { useRegion } from "./region-context";
import { REGIONS, regionFlag, regionShort } from "@/lib/region";

/**
 * Compact KE / US storefront toggle. Switching filters the catalogue and flips
 * the currency for the whole site (via RegionProvider -> router.refresh()).
 */
export function RegionSwitcher({
  inverted,
  className,
}: {
  inverted?: boolean;
  className?: string;
}) {
  const { region, setRegion } = useRegion();

  return (
    <div
      role="group"
      aria-label="Choose store region"
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-xs font-medium",
        inverted ? "border-white/30" : "border-border",
        className,
      )}
    >
      {REGIONS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRegion(r)}
          aria-pressed={region === r}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors",
            region === r
              ? "bg-gold text-navy"
              : inverted
                ? "text-white/80 hover:text-white"
                : "text-charcoal/70 hover:text-navy",
          )}
        >
          <span aria-hidden>{regionFlag[r]}</span>
          {regionShort[r]}
        </button>
      ))}
    </div>
  );
}
