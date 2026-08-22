"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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

/**
 * Instant moderation checklist — mirrors the DB `ee_listing_is_clean` function
 * that also runs server-side via cron. Rejects obviously prohibited / illegal
 * items at submit time so the seller gets immediate feedback.
 *
 * Applied to edits as well as new listings: without that, a listing could pass
 * the check when posted and then have prohibited content edited in afterwards.
 */
const PROHIBITED =
  /\b(guns?|handgun|shotgun|firearms?|rifle|pistol|revolver|glock|weapons?|ammo|ammunition|explosives?|grenade|cocaine|heroin|meth|methamphetamine|cannabis|marijuana|weed|mdma|ecstasy|lsd|fentanyl|ivory|rhino horn|pangolin|counterfeit|forged|stolen|fake id|passport|ssn|social security|human organ)\b/i;

type ListingFields = {
  title: string;
  description: string | null;
  price: number;
  category: (typeof CATEGORIES)[number];
  condition: (typeof CONDITIONS)[number] | null;
  location: string | null;
  primaryImageUrl: string | null;
};

/** Validate and normalise the shared listing form. Identical rules for create and edit. */
function parseListingForm(
  formData: FormData,
): { ok: true; fields: ListingFields } | { ok: false; message: string } {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const priceRaw = formData.get("price") as string;
  const category = formData.get("category") as string;
  const condition = formData.get("condition") as string;
  const location = (formData.get("location") as string)?.trim();
  const primaryImageUrl = (formData.get("primary_image_url") as string)?.trim();

  if (!title || !priceRaw || !category) {
    return { ok: false, message: "Title, price, and category are required." };
  }

  const price = parseFloat(priceRaw);
  if (isNaN(price) || price <= 0) {
    return { ok: false, message: "Please enter a valid price." };
  }

  if (PROHIBITED.test(`${title} ${description ?? ""}`)) {
    return {
      ok: false,
      message:
        "This listing appears to include prohibited or restricted items and can't be posted.",
    };
  }

  return {
    ok: true,
    fields: {
      title,
      description: description || null,
      price,
      category: ((CATEGORIES as readonly string[]).includes(category)
        ? category
        : "other") as (typeof CATEGORIES)[number],
      condition: ((CONDITIONS as readonly string[]).includes(condition)
        ? condition
        : null) as (typeof CONDITIONS)[number] | null,
      location: location || null,
      primaryImageUrl: primaryImageUrl || null,
    },
  };
}

/**
 * Marketplace reads are cached (see lib/queries). Any listing write has to drop
 * that cache or a seller's edit, or a sold item, sits stale on the marketplace
 * for up to a minute. One tag for the lot: listing writes are rare and a
 * marketplace-wide refresh is far cheaper than getting it subtly wrong.
 */
function revalidateListings(slugOfListing?: string | null) {
  // Two-argument form: the single-arg `revalidateTag(tag)` is deprecated in
  // Next 16. "max" gives stale-while-revalidate; the explicit revalidatePath
  // calls below cover the two pages the seller looks at immediately after.
  revalidateTag("listings", "max");
  revalidatePath("/account/listings");
  revalidatePath("/marketplace");
  if (slugOfListing) revalidatePath(`/marketplace/${slugOfListing}`);
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

  const parsed = parseListingForm(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };
  const { title, description, price, category, condition, location, primaryImageUrl } =
    parsed.fields;

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
      description,
      category,
      condition,
      price,
      currency,
      location,
      primary_image_url: primaryImageUrl,
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

  revalidateListings(listingSlug);

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
    .select("status, slug")
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

  revalidateListings(listing.slug);
  return {};
}

export async function removeListing(listingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { data: listing } = await supabase
    .from("user_listings")
    .select("status, slug")
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

  revalidateListings(listing.slug);
  return {};
}

/** Statuses a seller is allowed to edit. A sold or withdrawn listing is history. */
const EDITABLE = ["draft", "pending_review", "active", "rejected"] as const;

/**
 * Edit an existing listing.
 *
 * The SLUG IS NEVER REGENERATED, even when the title changes. It is the
 * listing's permanent URL: it is in the sitemap, it is what Google indexed, and
 * it is what the seller shared on WhatsApp. Renaming it on every title tweak
 * would 404 all of that and throw away whatever ranking the page had earned.
 * The page title, H1, meta description and Product schema all derive from the
 * title (see lib/marketplace), so an edit still updates everything a searcher
 * actually reads.
 *
 * Status handling mirrors the moderation pipeline in
 * supabase/listing-moderation.sql: a live listing stays live (the prohibited-
 * content check in parseListingForm is the same gate it passed on the way in),
 * and a REJECTED listing goes back to pending_review, because fixing a
 * rejection is the main reason a seller edits at all.
 */
export async function updateListing(
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be signed in to edit a listing." };

  const listingId = (formData.get("id") as string)?.trim();
  if (!listingId) return { status: "error", message: "Missing listing reference." };

  const parsed = parseListingForm(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };
  const { title, description, price, category, condition, location, primaryImageUrl } =
    parsed.fields;

  // Ownership is enforced twice: here for a clear error message, and by the
  // `user_id` filter on the update itself (plus RLS) so it cannot be bypassed.
  const { data: existing } = await supabase
    .from("user_listings")
    .select("status, slug")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!existing) return { status: "error", message: "Listing not found." };
  if (!(EDITABLE as readonly string[]).includes(existing.status)) {
    return {
      status: "error",
      message: `A ${existing.status.replace("_", " ")} listing can no longer be edited.`,
    };
  }

  const { error } = await supabase
    .from("user_listings")
    .update({
      title,
      description,
      category,
      condition,
      price,
      location,
      primary_image_url: primaryImageUrl,
      // A rejected listing re-enters the review queue; everything else keeps
      // the status it had. Currency and slug are deliberately untouched.
      ...(existing.status === "rejected" ? { status: "pending_review" as const } : {}),
    })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Update listing error:", error.message);
    return { status: "error", message: "Failed to save changes. Please try again." };
  }

  revalidateListings(existing.slug);
  redirect("/account/listings");
}
