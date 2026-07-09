"use server";

import { createClient } from "@/lib/supabase/server";

export type InquiryState = {
  status: "idle" | "success" | "error";
  message: string;
};

const INQUIRY_TYPES = ["consultation", "asset_review"] as const;
const SEGMENTS = [
  "individual",
  "family",
  "estate_executor",
  "business_owner",
  "expat",
  "embassy",
  "corporation",
] as const;
const DIVISIONS = [
  "estate_sales",
  "commercial_liquidation",
  "concierge",
  "expat_services",
] as const;

function clean(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function pick<T extends readonly string[]>(
  value: string | null,
  allowed: T,
): T[number] | null {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : null;
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const fullName = clean(formData.get("full_name"));
  const email = clean(formData.get("email"));
  const phone = clean(formData.get("phone"));
  const message = clean(formData.get("message"));

  if (!fullName || !email || !phone || !message) {
    return {
      status: "error",
      message: "Please complete name, email, phone, and a short message.",
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const inquiryType = pick(clean(formData.get("inquiry_type")), INQUIRY_TYPES) ?? "consultation";

  // Asset context — present when the lead came from a specific catalogue item
  // (the "Enquire about this piece" CTA passes these as hidden fields). We do
  // NOT write to the `asset_category` enum column (the asset's free-text
  // category won't match that enum); instead we record which item drove the
  // lead in `source` (slug), `subject` (title) and `metadata` (full ref).
  const assetSlug = clean(formData.get("asset_slug"));
  const assetTitle = clean(formData.get("asset_title"));
  const assetCategory = clean(formData.get("asset_category"));
  const hasAsset = Boolean(assetSlug || assetTitle);

  // Optional explicit source (e.g. the "Sell with us" form) + first-touch UTM.
  const sourceOverride = clean(formData.get("source"));
  let utm: Record<string, string> = {};
  try {
    const raw = clean(formData.get("utm"));
    if (raw) utm = JSON.parse(raw) as Record<string, string>;
  } catch {
    utm = {};
  }
  const hasUtm = Object.keys(utm).length > 0;

  const payload = {
    // `status` is a NOT NULL column on the Payload-owned inquiries table; its
    // Payload defaultValue is app-level only, so set it explicitly for the
    // direct (Supabase) insert.
    status: "new" as const,
    inquiry_type: inquiryType,
    full_name: fullName,
    email,
    phone,
    company: clean(formData.get("company")),
    client_segment: pick(clean(formData.get("client_segment")), SEGMENTS),
    service_division: pick(clean(formData.get("service_division")), DIVISIONS),
    location: clean(formData.get("location")),
    subject: assetTitle ? `Enquiry: ${assetTitle}` : null,
    message,
    asset_description: inquiryType === "asset_review" ? message : null,
    consent: formData.get("consent") === "on",
    // Real provenance: explicit source (e.g. sell_with_us) > asset slug > generic.
    source: sourceOverride ?? (assetSlug ? `asset:${assetSlug}` : "homepage_contact"),
    metadata:
      hasAsset || hasUtm
        ? {
            ...(hasAsset
              ? {
                  asset: {
                    slug: assetSlug,
                    title: assetTitle,
                    category: assetCategory,
                    url: assetSlug ? `/collection/${assetSlug}` : null,
                  },
                }
              : {}),
            ...(hasUtm ? { utm } : {}),
          }
        : null,
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert(payload);

    if (error) {
      console.error("Inquiry insert failed:", error.message);
      return {
        status: "error",
        message: "Something went wrong submitting your request. Please try again or call us.",
      };
    }

    return {
      status: "success",
      message:
        inquiryType === "asset_review"
          ? "Thank you. Our team will be in touch to arrange your asset review."
          : "Thank you. We will contact you shortly to schedule your consultation.",
    };
  } catch (err) {
    console.error("Inquiry action error:", err);
    return { status: "error", message: "Unexpected error. Please try again." };
  }
}
