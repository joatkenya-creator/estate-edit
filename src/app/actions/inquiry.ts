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
  const message = clean(formData.get("message"));

  if (!fullName || !email || !message) {
    return { status: "error", message: "Please complete name, email, and a short message." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const inquiryType = pick(clean(formData.get("inquiry_type")), INQUIRY_TYPES) ?? "consultation";

  const payload = {
    inquiry_type: inquiryType,
    full_name: fullName,
    email,
    phone: clean(formData.get("phone")),
    company: clean(formData.get("company")),
    client_segment: pick(clean(formData.get("client_segment")), SEGMENTS),
    service_division: pick(clean(formData.get("service_division")), DIVISIONS),
    location: clean(formData.get("location")),
    message,
    asset_description: inquiryType === "asset_review" ? message : null,
    consent: formData.get("consent") === "on",
    source: "homepage_contact",
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
          ? "Thank you — our team will be in touch to arrange your asset review."
          : "Thank you — we will contact you shortly to schedule your consultation.",
    };
  } catch (err) {
    console.error("Inquiry action error:", err);
    return { status: "error", message: "Unexpected error. Please try again." };
  }
}
