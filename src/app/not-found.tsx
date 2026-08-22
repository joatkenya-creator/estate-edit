import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace";

/**
 * Branded 404. Sold and withdrawn listings land here (the detail route only
 * serves `status = 'active'`), so it has to do more than apologise: it puts
 * the visitor one click from the marketplace, the category they were probably
 * after, and the rest of the site. `noindex` because a 404 body should never
 * be indexed, while the links still give crawlers a route back into the site.
 */
export const metadata: Metadata = {
  title: { absolute: "Page Not Found | The Estate Edit" },
  robots: { index: false, follow: true },
};

const PAGES = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/collection", label: "The Collection" },
  { href: "/estate-sales", label: "Estate Sales" },
  { href: "/commercial-liquidation", label: "Commercial Liquidation" },
  { href: "/concierge", label: "Concierge Transition" },
  { href: "/contact", label: "Contact Us" },
];

export default function NotFound() {
  return (
    <main className="flex-1 bg-stone">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 text-center sm:px-8 sm:pt-44">
        <p className="eyebrow mb-5">Error 404</p>
        <h1 className="font-display text-4xl font-light leading-tight text-navy sm:text-5xl">
          This page is no longer here
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-charcoal/65">
          The page or listing you were looking for has moved, sold, or been withdrawn by its
          seller. Everything currently available is one click away.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-navy text-white hover:bg-navy-soft">
            <Link href="/marketplace">Browse the Marketplace</Link>
          </Button>
          <Button asChild variant="outline" className="border-navy text-navy hover:bg-navy/5">
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-8 text-left sm:grid-cols-2">
          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
              Shop by category
            </h2>
            <ul className="mt-4 space-y-2">
              {MARKETPLACE_CATEGORIES.filter((c) => c.primary).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/marketplace/${c.slug}`}
                    className="text-sm text-charcoal/70 transition-colors hover:text-navy"
                  >
                    {c.noun} for sale in Kenya
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
              Estate Edit
            </h2>
            <ul className="mt-4 space-y-2">
              {PAGES.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="text-sm text-charcoal/70 transition-colors hover:text-navy"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
