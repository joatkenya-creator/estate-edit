"use client";

import { useEffect } from "react";
import { SuccessPanel } from "@/components/states/form-states";

/**
 * Shown at the top of My Listings after the listing form redirects here.
 * The submit went through, so the draft kept on this device is cleared.
 */
export function ListingSubmitted({ kind, listingId }: { kind: "posted" | "updated"; listingId?: string }) {
  useEffect(() => {
    try {
      localStorage.removeItem(`ee:draft:listing:${kind === "posted" ? "new" : listingId}`);
    } catch {}
  }, [kind, listingId]);

  return (
    <div className="rounded-xl border border-border bg-white px-6 py-6 shadow-sm">
      {kind === "posted" ? (
        <SuccessPanel title="Your listing has been submitted." action={{ label: "Post another item", href: "/sell/post" }}>
          <p>
            It is saved to your account below. Every listing is checked by our team before it goes
            live, to keep the Marketplace safe for buyers.
          </p>
          <p>Most listings go live within 24 hours. Its status changes to Active when it does.</p>
        </SuccessPanel>
      ) : (
        <SuccessPanel title="Your changes have been saved.">
          <p>
            A live listing shows your changes straight away. A listing that was rejected goes back
            to our team for review.
          </p>
        </SuccessPanel>
      )}
    </div>
  );
}
