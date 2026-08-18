"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRegion } from "@/lib/region.server";
import { regionCurrency } from "@/lib/region";

export type ListingState = {
  status: "idle" | "success" | "error" | "payment_required";
  message: string;
  listingId?: string;
  requiresFee?: boolean;
  feeAmount?: number;
};

const LISTING_FEE_KES = 500;
const LISTING_FEE_USD = 8;
// No sale commission — sellers keep 100%. Listing fees remain the only charge.
const COMMISSION_RATE = 0;

const CATEGORIES = [
  "furniture", "fine_art", "jewelry", "vehicles", "collectibles",
  "designer", "lighting", "rugs", "antiques", "equipment",
  "fleet", "inventory", "office", "other",
] as const;

const CONDITIONS = ["new", "excellent", "very_good", "good", "fair"] as const;

function slug(title: string): string {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
}

export async function createListing(
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in to post a listing." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const priceRaw = formData.get("price") as string;
  const category = formData.get("category") as string;
  const condition = formData.get("condition") as string;
  const location = (formData.get("location") as string)?.trim();
  const primaryImageUrl = (formData.get("primary_image_url") as string)?.trim();

  if (!title || !priceRaw || !category) {
    return { status: "error", message: "Title, price, and category are required." };
  }

  const price = parseFloat(priceRaw);
  if (isNaN(price) || price <= 0) {
    return { status: "error", message: "Please enter a valid price." };
  }

  const safeCategory = (CATEGORIES as readonly string[]).includes(category)
    ? (category as typeof CATEGORIES[number])
    : "other";
  const safeCondition = (CONDITIONS as readonly string[]).includes(condition)
    ? (condition as typeof CONDITIONS[number])
    : null;

  // Instant moderation checklist — mirrors the DB `ee_listing_is_clean` function
  // that also runs server-side via cron. Reject obviously prohibited / illegal
  // items at submit time so the seller gets immediate feedback.
  const PROHIBITED =
    /\b(guns?|handgun|shotgun|firearms?|rifle|pistol|revolver|glock|weapons?|ammo|ammunition|explosives?|grenade|cocaine|heroin|meth|methamphetamine|cannabis|marijuana|weed|mdma|ecstasy|lsd|fentanyl|ivory|rhino horn|pangolin|counterfeit|forged|stolen|fake id|passport|ssn|social security|human organ)\b/i;
  if (PROHIBITED.test(`${title} ${description ?? ""}`)) {
    return {
      status: "error",
      message:
        "This listing appears to include prohibited or restricted items and can't be posted.",
    };
  }

  // Check user's free tier status
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("free_listings_used")
    .eq("id", user.id)
    .single();

  const freeUsed = profile?.free_listings_used ?? 0;
  const isFree = freeUsed < 2;
  // Once both free slots are used, the seller can post paid listings immediately —
  // they do NOT need to have sold their free listings first.

  // Seller region -> native currency + listing fee (US sellers price in USD).
  const region = await getRegion();
  const currency = regionCurrency[region];
  const listingFee = region === "virginia" ? LISTING_FEE_USD : LISTING_FEE_KES;

  // Create the listing (draft initially if fee required)
  const listingSlug = slug(title);
  const { data: listing, error } = await supabase
    .from("user_listings")
    .insert({
      user_id: user.id,
      slug: listingSlug,
      title,
      description: description || null,
      category: safeCategory,
      condition: safeCondition,
      price,
      currency,
      location: location || null,
      primary_image_url: primaryImageUrl || null,
      is_free_listing: isFree,
      listing_fee_paid: isFree,        // free listings don't need fee payment
      listing_fee_amount: listingFee,
      commission_rate: COMMISSION_RATE,
      // Free listings go straight to pending_review; paid listings stay draft until fee paid
      status: isFree ? "pending_review" : "draft",
    })
    .select("id")
    .single();

  if (error || !listing) {
    console.error("Create listing error:", error?.message);
    return { status: "error", message: "Failed to create listing. Please try again." };
  }

  // Increment free_listings_used counter
  if (isFree) {
    await supabase
      .from("user_profiles")
      .update({ free_listings_used: freeUsed + 1 })
      .eq("id", user.id);
  }

  revalidatePath("/account/listings");

  if (!isFree) {
    return {
      status: "payment_required",
      message: `Listing created. Complete the ${currency} ${listingFee} payment to publish it.`,
      listingId: listing.id,
      requiresFee: true,
      feeAmount: listingFee,
    };
  }

  redirect("/account/listings");
}

/**
 * Flips a listing between `active` and `sold`. Sold listings drop out of the
 * marketplace (it filters `status = 'active'`) but stay in the seller's
 * account, so a fallen-through sale can be relisted without reposting.
 */
export async function toggleListingSold(listingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { data: listing } = await supabase
    .from("user_listings")
    .select("status")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing) return { error: "Listing not found." };
  if (listing.status !== "active" && listing.status !== "sold") {
    return { error: "Only a published listing can be marked sold." };
  }

  const { error } = await supabase
    .from("user_listings")
    .update({ status: listing.status === "sold" ? "active" : "sold" })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account/listings");
  return {};
}

export async function removeListing(listingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { data: listing } = await supabase
    .from("user_listings")
    .select("status")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing) return { error: "Listing not found." };

  // A draft was never public and has no payment attached, so delete it outright
  // (RLS only permits DELETE on drafts anyway). Anything that has been live is
  // withdrawn instead: it leaves the marketplace immediately, but its
  // listing_payments row survives — that table cascades on delete.
  const { error } =
    listing.status === "draft"
      ? await supabase
          .from("user_listings")
          .delete()
          .eq("id", listingId)
          .eq("user_id", user.id)
      : await supabase
          .from("user_listings")
          .update({ status: "withdrawn" })
          .eq("id", listingId)
          .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account/listings");
  return {};
}
