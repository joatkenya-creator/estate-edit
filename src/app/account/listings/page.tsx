import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Tag, Plus, Eye, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getRegion } from "@/lib/region.server";
import { regionCurrency } from "@/lib/region";
import { paystackPublicKey } from "@/lib/paystack-key";
import { PayListingButton } from "@/components/listings/pay-listing-button";
import { RemoveListingButton } from "@/components/listings/remove-listing-button";
import { MarkSoldButton } from "@/components/listings/mark-sold-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Listings", robots: { index: false } };

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-stone text-charcoal/60",
  pending_review: "bg-yellow-50 text-yellow-700",
  active: "bg-green-50 text-green-700",
  sold: "bg-blue-50 text-blue-700",
  withdrawn: "bg-stone text-charcoal/50",
  rejected: "bg-red-50 text-red-700",
};

export default async function ListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const region = await getRegion();
  const currency = regionCurrency[region];
  const listingFee = region === "virginia" ? 8 : 500;

  const [profileResult, listingsResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("free_listings_used")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_listings")
      .select(
        "id, slug, title, status, price, currency, views, is_free_listing, listing_fee_paid, listing_fee_amount, primary_image_url, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileResult.data;
  const listings = listingsResult.data ?? [];
  const freeUsed = profile?.free_listings_used ?? 0;
  const canPostFree = freeUsed < 2;
  const isPaidTier = freeUsed >= 2;
  const paystackKey = paystackPublicKey();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-white p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl text-navy">My Listings</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Manage your marketplace listings
          </p>
        </div>
        <Button asChild className="bg-navy text-white hover:bg-navy-soft">
          <Link href="/sell/post">
            <Plus className="mr-2 size-4" />
            {canPostFree ? "Post free listing" : isPaidTier ? `Post listing (${currency} ${listingFee})` : "Post listing"}
          </Link>
        </Button>
      </div>

      {/* Tier info */}
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium text-gold-dark">
            {isPaidTier
              ? `You are on the paid tier — ${currency} ${listingFee} per listing`
              : `Free tier: ${freeUsed}/2 slots used · ${2 - freeUsed} remaining`}
          </span>
        </div>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
          <Tag className="mx-auto mb-4 size-10 text-charcoal/30" />
          <p className="font-medium text-navy">No listings yet</p>
          <p className="mt-1 text-sm text-charcoal/60">
            Your first two listings are completely free.
          </p>
          <Button asChild className="mt-4 bg-navy text-white hover:bg-navy-soft">
            <Link href="/sell/post">Post your first listing</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-xl border border-border bg-white shadow-sm"
            >
              {listing.primary_image_url && (
                <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-stone">
                  <img
                    src={listing.primary_image_url}
                    alt={listing.title}
                    className="size-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-navy line-clamp-1">{listing.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[listing.status] ?? "bg-stone text-charcoal/60"
                    }`}
                  >
                    {listing.status.replace("_", " ")}
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-navy">
                  {listing.currency || "KES"} {Number(listing.price).toLocaleString()}
                </p>

                <div className="mt-2 flex items-center gap-3 text-xs text-charcoal/50">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3" /> {listing.views} views
                  </span>
                  <span>·</span>
                  <span>{listing.is_free_listing ? "Free listing" : "Paid listing"}</span>
                </div>

                {listing.status === "draft" && !listing.listing_fee_paid && (
                  <div className="mt-3 space-y-1.5 rounded-lg border border-gold/30 bg-gold/5 p-3">
                    <p className="text-xs text-gold-dark">
                      Not published yet — pay the listing fee to send it for review.
                    </p>
                    <PayListingButton
                      listingId={listing.id}
                      amount={Number(listing.listing_fee_amount ?? listingFee)}
                      currency={listing.currency || currency}
                      email={user.email ?? ""}
                      paystackKey={paystackKey}
                      size="sm"
                      className="w-full bg-navy text-white hover:bg-navy-soft"
                    />
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  {listing.status === "active" && (
                    <Link
                      href={`/marketplace/${listing.slug}`}
                      className="flex items-center gap-1 text-xs text-navy hover:underline"
                    >
                      <Eye className="size-3" /> View
                    </Link>
                  )}
                  {(listing.status === "draft" || listing.status === "active") && (
                    <Link
                      href={`/sell/edit/${listing.id}`}
                      className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-navy"
                    >
                      <Edit className="size-3" /> Edit
                    </Link>
                  )}
                  {(listing.status === "active" || listing.status === "sold") && (
                    <MarkSoldButton
                      listingId={listing.id}
                      isSold={listing.status === "sold"}
                    />
                  )}
                  {listing.status !== "withdrawn" && (
                    <RemoveListingButton
                      listingId={listing.id}
                      isDraft={listing.status === "draft"}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
