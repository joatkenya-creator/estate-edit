import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/listings/listing-form";
import { getRegion } from "@/lib/region.server";
import { regionCurrency } from "@/lib/region";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post a listing",
  description: "List your item for sale on The Estate Edit marketplace.",
};

export default async function PostListingPage() {
  const region = await getRegion();
  const currency = regionCurrency[region];
  const listingFee = region === "virginia" ? 5 : 500;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/sell/post");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("free_listings_used, free_listings_sold")
    .eq("id", user.id)
    .single();

  const freeUsed = profile?.free_listings_used ?? 0;
  const freeSold = profile?.free_listings_sold ?? 0;
  const isFree = freeUsed < 2;
  const freeRemaining = Math.max(0, 2 - freeUsed);

  // Block if both free slots used but user hasn't sold both yet
  if (!isFree && freeSold < 2) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-navy">Your listings are pending</h1>
        <p className="mt-3 text-charcoal/60">
          You&apos;ve used both free listing slots. Once your existing listings sell, you&apos;ll be
          able to post more at {currency} {listingFee} per listing.
        </p>
        <Link
          href="/account/listings"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-navy hover:underline"
        >
          <ArrowLeft className="size-4" /> View my listings
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href="/sell"
        className="mb-6 inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-navy"
      >
        <ArrowLeft className="size-4" /> Back to Sell
      </Link>

      <h1 className="mb-2 font-display text-3xl text-navy">Post a listing</h1>
      <p className="mb-8 text-charcoal/60">
        {isFree
          ? `Your first ${freeRemaining === 2 ? "two listings are" : "listing is"} free. No payment required.`
          : `You're on the paid tier. Fill in your item details and pay the ${currency} ${listingFee} listing fee to go live.`}
      </p>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <ListingForm isFree={isFree} freeRemaining={freeRemaining} />
      </div>
    </main>
  );
}
