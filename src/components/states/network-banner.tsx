"use client";

import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";
import { useOnline } from "@/components/states/form-states";

/**
 * Slim notice under the header when the connection drops, and a brief
 * "Back online" when it returns. Nothing on the page is cleared: already
 * loaded listings stay put, and the service worker serves pages and photos
 * the visitor has opened before.
 */
export function NetworkBanner() {
  const online = useOnline();
  const [dismissed, setDismissed] = useState(false);
  const [back, setBack] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const off = () => {
      setDismissed(false);
      setBack(false);
    };
    const on = () => {
      setBack(true);
      clearTimeout(t);
      t = setTimeout(() => setBack(false), 4000);
    };
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => {
      clearTimeout(t);
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
    };
  }, []);

  // Production only: a dev service worker would cache stale bundles.
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (online && !back) return null;
  if (!online && dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-20 z-40 flex justify-center px-3 pt-2"
    >
      <div className="flex w-full max-w-2xl items-start gap-3 rounded-lg border border-gold/40 bg-navy px-4 py-2.5 text-sm text-white shadow-lg">
        {online ? (
          <p className="flex-1">Back online.</p>
        ) : (
          <>
            <WifiOff className="mt-0.5 size-4 shrink-0 text-gold-soft" aria-hidden />
            <p className="flex-1 leading-snug text-white/85">
              You&apos;re offline. You can keep browsing pieces you&apos;ve already opened and fill in
              forms. We&apos;ll send your request when you&apos;re back online.
            </p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss offline notice"
              className="-m-1 grid size-8 shrink-0 place-items-center rounded text-white/60 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
