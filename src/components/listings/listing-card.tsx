import Link from "next/link";
import { Eye, MapPin } from "lucide-react";

type Listing = {
  slug: string;
  title: string;
  description?: string | null;
  price: number;
  category: string;
  condition?: string | null;
  location?: string | null;
  primary_image_url?: string | null;
  views: number;
  user_profiles?: { full_name?: string | null } | null;
};

export function ListingCard({ listing }: { listing: Listing }) {
  const category = listing.category.replace(/_/g, " ");
  const condition = listing.condition?.replace(/_/g, " ");

  return (
    <Link
      href={`/marketplace/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-stone">
        {listing.primary_image_url ? (
          <img
            src={listing.primary_image_url}
            alt={listing.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          <h3 className="font-medium text-navy leading-snug line-clamp-2">{listing.title}</h3>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-stone px-2 py-0.5 text-xs text-charcoal/60 capitalize">
            {category}
          </span>
          {condition && (
            <span className="rounded-full bg-stone px-2 py-0.5 text-xs text-charcoal/60 capitalize">
              {condition}
            </span>
          )}
        </div>

        {listing.description && (
          <p className="mt-2 text-xs text-charcoal/50 line-clamp-2">{listing.description}</p>
        )}

        <div className="mt-auto pt-3">
          <p className="font-display text-lg font-semibold text-navy">
            KES {Number(listing.price).toLocaleString()}
          </p>

          <div className="mt-1 flex items-center justify-between text-xs text-charcoal/40">
            <div className="flex items-center gap-1">
              {listing.location && (
                <>
                  <MapPin className="size-3" /> {listing.location}
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="size-3" /> {listing.views}
            </div>
          </div>

          {listing.user_profiles?.full_name && (
            <p className="mt-1 text-xs text-charcoal/40">
              by {listing.user_profiles.full_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
