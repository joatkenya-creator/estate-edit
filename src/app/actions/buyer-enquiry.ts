"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site";
import { getCompany } from "@/lib/companies";
import { getDevelopment, getUnitType } from "@/lib/developments";
import {
  BUYER_TYPES,
  CONTACT_METHODS,
  ENQUIRY_TYPES,
  VIEWING_ENQUIRIES,
  hasErrors,
  normalizePhone,
  validateBuyerEnquiry,
} from "@/lib/validation";
import type { InquiryState } from "@/app/actions/inquiry";

/**
 * Who hears about a development lead. Kings' sales inbox joins once Kings
 * names it and the agency agreement covers sharing leads (brief 3.4, 12 #10).
 */
const LEAD_INBOXES = [siteConfig.email];

const FIELDS = [
  "full_name", "email", "phone", "buyer_type", "enquiry_type", "preferred_contact",
  "preferred_date", "preferred_time", "message", "consent",
] as const;

const OUR_SIDE =
  "Something went wrong on our side and your request was not sent. Your details are still here. Try again, or reach us directly.";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const labelOf = (list: readonly { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v;

export async function submitBuyerEnquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never see this field. Pretend it worked.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success", message: "Thank you. We have your request." };
  }

  const values = Object.fromEntries(
    FIELDS.map((k) => [k, typeof formData.get(k) === "string" ? String(formData.get(k)).trim() : undefined]),
  );
  const fieldErrors = validateBuyerEnquiry(values);
  if (hasErrors(fieldErrors)) return { status: "error", message: "Some fields need your attention.", fieldErrors };

  // Context comes from our own data, never from free text the browser sent.
  const dev = getDevelopment(String(formData.get("development") ?? ""));
  if (!dev) return { status: "error", message: OUR_SIDE };
  const unit = getUnitType(dev, String(formData.get("unit") ?? ""));

  const ip = getClientIp(await headers());
  if (!(await rateLimit(`buyer-enquiry:${ip}`, { limit: 6, windowSeconds: 3600 })).allowed) {
    return { status: "error", message: "Too many requests from this connection. Please try again later, or call or WhatsApp us." };
  }

  let utm: Record<string, string> = {};
  try {
    const raw = (await cookies()).get("ee_utm")?.value;
    if (raw) utm = JSON.parse(decodeURIComponent(raw));
  } catch {
    utm = {};
  }

  const enquiryType = values.enquiry_type!;
  const viewing = VIEWING_ENQUIRIES.includes(enquiryType) && values.preferred_date
    ? { date: values.preferred_date, time: values.preferred_time || null }
    : null;
  const what = unit ? `${dev.name} – ${unit.name}` : dev.name;
  const developer = getCompany(dev.developer)!;

  const row = {
    status: "new" as const,
    // The DB enum only knows consultation | asset_review; the buyer detail lives in metadata.
    inquiry_type: "consultation" as const,
    full_name: values.full_name!,
    email: values.email!,
    phone: normalizePhone(values.phone)!,
    preferred_contact: values.preferred_contact!,
    subject: `${labelOf(ENQUIRY_TYPES, enquiryType)}: ${what}`,
    message: values.message || null,
    consent: true,
    source: `development:${dev.slug}${unit ? `/${unit.slug}` : ""}`,
    metadata: {
      development: { slug: dev.slug, name: dev.name, developer: developer.slug },
      unit_type: unit ? { slug: unit.slug, name: unit.name, size_sqft: unit.sizeSqft } : null,
      enquiry_type: enquiryType,
      buyer_type: values.buyer_type,
      viewing,
      utm,
      // Stamped when the lead is forwarded to the developer (brief 5, 7.8).
      shared_with_developer_at: null,
    },
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert(row);
    if (error) {
      console.error("Buyer enquiry insert failed:", error.message);
      return { status: "error", message: OUR_SIDE };
    }
  } catch (err) {
    console.error("Buyer enquiry error:", err);
    return { status: "error", message: OUR_SIDE };
  }

  // The lead is saved; a mail failure is logged, not shown to the buyer.
  const lines: [string, string][] = [
    ["Development", dev.name],
    ["Unit type", unit?.name ?? "Not specified"],
    ["Request", labelOf(ENQUIRY_TYPES, enquiryType)],
    ["Buyer", labelOf(BUYER_TYPES, values.buyer_type!)],
    ["Name", row.full_name],
    ["Phone", row.phone],
    ["Email", row.email],
    ["Contact by", labelOf(CONTACT_METHODS, row.preferred_contact)],
    ...(viewing ? [["Viewing", `${viewing.date}${viewing.time ? ` ${viewing.time}` : ""}`] as [string, string]] : []),
    ["Message", row.message ?? ""],
    ["Source", Object.keys(utm).length ? JSON.stringify(utm) : "direct"],
  ];
  const mail = await sendEmail({
    to: LEAD_INBOXES,
    subject: `New lead: ${row.subject}`,
    replyTo: row.email,
    html: `<table>${lines.map(([k, v]) => `<tr><th align="left">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>`,
  }).catch((err) => ({ ok: false, error: String(err) }));
  if (!mail.ok) console.error("Buyer enquiry email failed:", mail.error);

  return {
    status: "success",
    message: `Thank you. Our sales team will contact you about ${what} within one business day.`,
  };
}
