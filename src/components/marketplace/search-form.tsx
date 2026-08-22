"use client";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

/**
 * Marketplace search. A plain GET form (so results are a shareable URL and
 * work without JavaScript) with one addition: the query is reported to GA4,
 * which is what tells us what buyers are looking for and aren't finding.
 */
export function MarketplaceSearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form
      className="flex flex-1 items-center gap-2"
      onSubmit={(e) => {
        const q = new FormData(e.currentTarget).get("q");
        if (typeof q === "string" && q.trim()) track("marketplace_search", { search_term: q.trim() });
      }}
    >
      <label htmlFor="marketplace-q" className="sr-only">
        Search marketplace listings
      </label>
      <input
        id="marketplace-q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search listings…"
        className="min-w-0 flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button type="submit" size="sm" className="bg-navy text-white hover:bg-navy-soft">
        Search
      </Button>
    </form>
  );
}
