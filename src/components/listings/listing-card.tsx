import Link from "next/link";
import Image from "next/image";
import { Eye, MapPin } from "lucide-react";
import {
  categoryLabel,
  formatListingPrice,
  listingImageAlt,
  resolvePlace,
} from "@/lib/marketplace";

type Listing = {
  slug: string;
  title: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  category: string;
  condition?: string | null;
  location?: string | null;
  primary_image_url?: string | null;
  views: number;
  user_profiles?: { full_name?: string | null } | null;
};

/**
 * Grid card for a marketplace listing.
 *
 * `priority` is for the first row only: those images are the LCP element on
 * the marketplace and category pages, so they are preloaded while everything
 * below the fold stays lazy. Every image goes through next/image, which emits
 * width/height (no layout shift), a responsive srcset, and modern formats.
 */
export function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing;
  priority?: boolean;
}) {
  const condition = listing.condition?.replace(/_/g, " ");
  const place = resolvePlace(listing.location);

  return (
    <Link
      href={`/marketplace/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone">
        {listing.primary_image_url ? (
          <Image
            src={listing.primary_image_url}
            alt={listingImageAlt(listing)}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-charcoal/20">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-snug text-navy line-clamp-2">{listing.title}</h3>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-stone px-2 py-0.5 text-xs text-charcoal/60">
            {categoryLabel(listing.category)}
          </span>
          {condition && (
            <span className="rounded-full bg-stone px-2 py-0.5 text-xs capitalize text-charcoal/60">
              {condition}
            </span>
          )}
        </div>

        {listing.description && (
          <p className="mt-2 text-xs text-charcoal/50 line-clamp-2">{listing.description}</p>
        )}

        <div className="mt-auto pt-3">
          <p className="font-display text-lg font-semibold text-navy">
            {formatListingPrice(listing.price, listing.currency)}
          </p>

          <div className="mt-1 flex items-center justify-between text-xs text-charcoal/40">
            <div className="flex min-w-0 items-center gap-1">
              {place && (
                <>
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{place.label}</span>
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Eye className="size-3" /> {listing.views}
            </div>
          </div>

          {listing.user_profiles?.full_name && (
            <p className="mt-1 text-xs text-charcoal/40">by {listing.user_profiles.full_name}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
