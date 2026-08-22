import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getMarketplaceListings } from "@/lib/queries";
import { getRegion } from "@/lib/region.server";
import { regionContent } from "@/lib/site";
import {
  MARKETPLACE_CATEGORIES,
  formatListingPrice,
  listingImageAlt,
  resolvePlace,
} from "@/lib/marketplace";

/**
 * Homepage marketplace section.
 *
 * The Marketplace was previously reachable only from the header nav, which
 * left the newest seller listings four clicks and zero homepage links from the
 * strongest page on the domain. This is that missing link: real <a> hrefs from
 * the homepage to the newest listings and to each category landing page, which
 * is how internal authority reaches a listing that has no backlinks of its own.
 *
 * Presented as an editorial "shop" band rather than a classifieds grid — the
 * estate advisory positioning is the reason a seller trusts the platform, and
 * it stays intact.
 */
export async function MarketplaceTeaser({ limit = 4 }: { limit?: number }) {
  const region = await getRegion();
  const listings = (await getMarketplaceListings(region, "", "")).slice(0, limit);
  if (listings.length === 0) return null;

  const place = regionContent[region].place;

  return (
    <section id="marketplace" className="bg-stone py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">The Marketplace</p>
            <h2 className="text-balance font-display text-4xl font-light text-navy sm:text-5xl">
              Shop curated furniture &amp; estate items in {place}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Alongside the estates we manage, vetted sellers list their own pieces here — priced by
            the owner, viewed in person, bought directly.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing, i) => {
            const spot = resolvePlace(listing.location);
            return (
              <Reveal key={listing.slug} delay={i % 4}>
                <Link
                  href={`/marketplace/${listing.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone">
                    {listing.primary_image_url ? (
                      <Image
                        src={listing.primary_image_url}
                        alt={listingImageAlt(listing)}
                        fill
                        sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-display text-5xl text-charcoal/10">
                        EE
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-medium leading-snug text-navy line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="mt-auto pt-3 font-display text-lg font-semibold text-navy">
                      {formatListingPrice(listing.price, listing.currency)}
                    </p>
                    {spot && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-charcoal/45">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{spot.label}</span>
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Category links: the crawl path from the homepage into every
            marketplace landing page. */}
        <Reveal className="mt-10 flex flex-wrap justify-center gap-2">
          {MARKETPLACE_CATEGORIES.filter((c) => c.primary).map((c) => (
            <Link
              key={c.slug}
              href={`/marketplace/${c.slug}`}
              className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
            >
              {c.noun} for sale in {place}
            </Link>
          ))}
        </Reveal>

        <Reveal className="mt-10 flex justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group h-12 border-navy/20 px-8 text-navy hover:bg-navy hover:text-white"
          >
            <Link href="/marketplace">
              Browse the Marketplace
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
