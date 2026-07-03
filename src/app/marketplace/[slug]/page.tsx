import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Tag, Eye, Calendar, MessageCircle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRegion } from "@/lib/region.server";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOpenGraph, clampDescription, listingJsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_listings")
    .select("title, description, primary_image_url, location")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!data) return { title: "Listing not found" };

  const title = data.title ?? "Listing";
  const description = clampDescription(
    data.description ??
      `${title} — available on The Estate Edit Marketplace${data.location ? ` in ${data.location}` : ""}. Enquire directly with the seller.`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/marketplace/${slug}` },
    openGraph: buildOpenGraph({
      title,
      description,
      path: `/marketplace/${slug}`,
      images: data.primary_image_url ? [{ url: data.primary_image_url }] : undefined,
    }),
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("user_listings")
    .select(`
      id, slug, title, description, price, category, condition, location,
      primary_image_url, views, created_at, currency,
      user_id,
      user_profiles ( full_name, phone, location, avatar_url )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!listing) notFound();

  // Increment view count (fire-and-forget)
  supabase
    .from("user_listings")
    .update({ views: listing.views + 1 })
    .eq("id", listing.id)
    .then(() => {});

  const profile = Array.isArray(listing.user_profiles)
    ? listing.user_profiles[0]
    : listing.user_profiles;

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === listing.user_id;

  // Virginia sellers are contacted by email (no phone shown); Kenya keeps phone
  // (WhatsApp / call). The seller's email lives in auth.users, not the profile.
  const isVa = (await getRegion()) === "virginia";
  let sellerEmail: string | null = null;
  if (isVa && !isOwner) {
    try {
      const admin = createAdminClient();
      const { data: authUser } = await admin.auth.admin.getUserById(listing.user_id);
      sellerEmail = authUser?.user?.email ?? null;
    } catch {
      sellerEmail = null;
    }
  }

  const category = listing.category?.replace(/_/g, " ") ?? "";
  const condition = listing.condition?.replace(/_/g, " ") ?? "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <JsonLd
        data={listingJsonLd({
          slug: listing.slug,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          currency: listing.currency,
          primary_image_url: listing.primary_image_url,
          condition: listing.condition,
        })}
      />
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-charcoal/60">
        <Link href="/marketplace" className="inline-flex items-center gap-2 hover:text-navy">
          <ArrowLeft className="size-4" /> Back to Marketplace
        </Link>
        {category && (
          <>
            <span className="text-charcoal/30">/</span>
            <Link
              href={`/marketplace?category=${listing.category}`}
              className="capitalize hover:text-navy hover:underline"
            >
              {category}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: Image + details */}
        <div>
          {/* Primary image */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone">
            {listing.primary_image_url ? (
              <img
                src={listing.primary_image_url}
                alt={listing.title ?? ""}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-6xl text-charcoal/20">
                📦
              </div>
            )}
          </div>

          {/* Details */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {category && (
                <span className="rounded-full bg-stone px-3 py-1 text-xs capitalize text-charcoal/60">
                  <Tag className="inline size-3 mr-1" />{category}
                </span>
              )}
              {condition && (
                <span className="rounded-full bg-stone px-3 py-1 text-xs capitalize text-charcoal/60">
                  {condition}
                </span>
              )}
            </div>

            {listing.description && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-charcoal/40">
                  Description
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
                  {listing.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-charcoal/40">
              {listing.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {listing.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {listing.views} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(listing.created_at).toLocaleDateString("en-KE", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Price + contact */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h1 className="font-display text-2xl leading-snug text-navy">{listing.title}</h1>
            <p className="mt-3 font-display text-3xl font-semibold text-navy">
              {listing.currency || "KES"} {Number(listing.price).toLocaleString()}
            </p>

            {isOwner ? (
              <div className="mt-4 rounded-lg bg-stone p-3 text-center text-sm text-charcoal/60">
                This is your listing.{" "}
                <Link href="/account/listings" className="font-medium text-navy hover:underline">
                  Manage it
                </Link>
              </div>
            ) : isVa ? (
              /* Virginia: email only — no phone shown. */
              <div className="mt-5 space-y-3">
                {sellerEmail ? (
                  <Button asChild className="w-full bg-navy text-white hover:bg-navy-soft">
                    <a href={`mailto:${sellerEmail}?subject=${encodeURIComponent(`Interested in: ${listing.title}`)}`}>
                      <Mail className="mr-2 size-4" />
                      Email seller
                    </a>
                  </Button>
                ) : (
                  <p className="text-center text-sm text-charcoal/50">
                    Seller hasn&apos;t added contact details yet.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {profile?.phone && (
                  <Button
                    asChild
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <a href={`https://wa.me/${(profile.phone as string).replace(/\D/g, "")}?text=Hi, I'm interested in your listing: ${listing.title}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 size-4" />
                      Contact on WhatsApp
                    </a>
                  </Button>
                )}
                {profile?.phone && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-navy text-navy hover:bg-navy/5"
                  >
                    <a href={`tel:${(profile.phone as string).replace(/\s/g, "")}`}>
                      Call seller
                    </a>
                  </Button>
                )}
                {!profile?.phone && (
                  <p className="text-center text-sm text-charcoal/50">
                    Seller hasn&apos;t added a contact number yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Seller card */}
          {profile && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-charcoal/40">
                Seller
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-navy text-white text-sm font-semibold">
                  {(profile as { full_name?: string })?.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-medium text-navy">
                    {(profile as { full_name?: string })?.full_name ?? "Anonymous"}
                  </p>
                  {(profile as { location?: string })?.location && (
                    <p className="text-xs text-charcoal/50">
                      <MapPin className="inline size-3 mr-0.5" />
                      {(profile as { location?: string })?.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Safety notice */}
          <div className="rounded-xl border border-border bg-stone p-4 text-xs text-charcoal/60">
            <p className="font-semibold text-navy">Stay safe</p>
            <ul className="mt-1.5 space-y-1">
              <li>• Meet in a public place for the exchange</li>
              <li>• Inspect the item before paying</li>
              <li>• Never pay in advance without seeing the item</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
