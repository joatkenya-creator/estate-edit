"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { regionFromCountry, regionHost, regionLabel, type Region } from "@/lib/region";

const DISMISS_KEY = "ee_region_banner_v1";

/**
 * Soft, dismissible suggestion to switch stores when the visitor's location
 * doesn't match the current market's host. Deliberately NOT a redirect: crawlers
 * (which don't run this) keep seeing the Kenya store at the apex and the Virginia
 * store at us.*, so both stay independently indexable.
 */
export function RegionBanner() {
  const [target, setTarget] = useState<Region | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }
    const host = window.location.hostname.toLowerCase();
    // Only meaningful on the real storefront hosts.
    if (!host.endsWith("estateedit.org")) return;
    const current: Region = host.startsWith("us.") ? "virginia" : "kenya";

    (async () => {
      let country: string | null = null;
      try {
        const text = await fetch("/cdn-cgi/trace", { cache: "no-store" }).then((r) => r.text());
        country = text.match(/loc=([A-Z]{2})/)?.[1] ?? null;
      } catch {
        return;
      }
      const suggested = regionFromCountry(country);
      if (suggested !== current) setTarget(suggested);
    })();
  }, []);

  if (!target) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setTarget(null);
  };

  const href = `https://${regionHost[target]}${window.location.pathname}${window.location.search}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-gold/30 bg-navy/95 px-4 py-3 text-sm text-white backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 text-center">
        <span>
          Shopping from {regionLabel[target]}? Visit our {regionLabel[target]} store for local
          pricing &amp; delivery.
        </span>
        <a
          href={href}
          className="shrink-0 rounded-md bg-gold px-3 py-1 font-medium text-navy transition-colors hover:bg-gold-soft"
        >
          Switch
        </a>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="shrink-0 text-white/60 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
