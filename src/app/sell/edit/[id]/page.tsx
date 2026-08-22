import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingForm, type EditableListing } from "@/components/listings/listing-form";
import { paystackPublicKey } from "@/lib/paystack-key";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit listing",
  robots: { index: false }, // a seller's own listing form; nothing to index
};

/** Statuses a seller can still edit — mirrors EDITABLE in app/actions/listings.ts. */
const EDITABLE = ["draft", "pending_review", "active", "rejected"];

const STATUS_NOTE: Record<string, string> = {
  draft: "This listing is not published yet. Pay the listing fee from My Listings to send it for review.",
  pending_review: "This listing is in the review queue. It goes live automatically once it clears.",
  active: "This listing is live on the marketplace.",
  rejected: "This listing was rejected by the automatic content check. Fix it and save to resubmit.",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?next=/sell/edit/${id}`);

  // Scoped to the signed-in user, so someone else's listing id is simply "not
  // found" rather than a forbidden page that confirms it exists.
  const { data: listing } = await supabase
    .from("user_listings")
    .select("id, slug, title, description, price, category, condition, location, primary_image_url, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!listing) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-24 sm:pt-28">
      <Link
        href="/account/listings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-navy"
      >
        <ArrowLeft className="size-4" /> Back to My Listings
      </Link>

      <h1 className="mb-2 font-display text-3xl text-navy">Edit listing</h1>
      <p className="mb-2 text-charcoal/60">
        {STATUS_NOTE[listing.status] ?? "Update the details of your listing."}
      </p>
      {listing.status === "active" && (
        <p className="mb-8 text-sm">
          <Link
            href={`/marketplace/${listing.slug}`}
            className="inline-flex items-center gap-1.5 text-navy underline-offset-4 hover:underline"
          >
            View it on the marketplace <ExternalLink className="size-3.5" />
          </Link>
        </p>
      )}

      {EDITABLE.includes(listing.status) ? (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <ListingForm
            // Free-tier state is irrelevant to an edit — the fee, if there was
            // one, was settled when the listing was created.
            isFree
            freeRemaining={0}
            userEmail={user.email ?? ""}
            paystackKey={paystackPublicKey()}
            listing={listing as EditableListing}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-navy">
            A {listing.status.replace("_", " ")} listing can no longer be edited
          </p>
          <p className="mt-1 text-sm text-charcoal/60">
            Relist it from My Listings if you want to sell it again.
          </p>
        </div>
      )}
    </main>
  );
}
