/**
 * Form rules shared by the browser and the server actions, so a field can only
 * fail for one reason and the message is identical wherever it is caught.
 * Each validator returns `{ field: message }` for the fields that are wrong;
 * an empty object means the input is valid.
 */
export type FieldErrors = Partial<Record<string, string>>;
type Values = Record<string, string | undefined | null>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_HINT = "Enter a phone number like 0712 345 678 or +254 712 345 678.";
export const PHOTO_RULES = "JPG, PNG or WebP, up to 10 MB each, at least 1 photo.";
export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const v = (x: string | undefined | null) => (x ?? "").trim();

/**
 * Accepts Kenyan local numbers (0712 345 678, 0112 345 678), 254… and any
 * international +E.164 number. Returns the number in E.164, or null.
 */
export function normalizePhone(raw: string | undefined | null): string | null {
  const s = v(raw).replace(/[\s\-().]/g, "");
  let e164 = s;
  if (/^0[17]\d{8}$/.test(s)) e164 = `+254${s.slice(1)}`;
  else if (/^254\d{9}$/.test(s)) e164 = `+${s}`;
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) return null;
  // Kenyan numbers are always +254 followed by 9 digits.
  if (e164.startsWith("+254") && e164.length !== 13) return null;
  return e164;
}

function emailError(raw: string | undefined | null): string | undefined {
  if (!v(raw)) return "Enter your email address.";
  if (!EMAIL.test(v(raw))) return "Enter an email address like name@example.com.";
}

/* Buyer enquiry (new developments, brief 7.6). Values are what's stored in inquiries.metadata. */
export const BUYER_TYPES = [
  { value: "own_use", label: "Buying a home to live in" },
  { value: "investor", label: "Investor" },
  { value: "diaspora", label: "Buying from abroad (diaspora)" },
  { value: "agent", label: "Agent" },
] as const;
export const ENQUIRY_TYPES = [
  { value: "price_list", label: "Price list" },
  { value: "brochure", label: "Brochure" },
  { value: "viewing", label: "Site viewing" },
  { value: "virtual_viewing", label: "Virtual viewing" },
  { value: "payment_plan", label: "Payment plan" },
  { value: "reservation", label: "Request to reserve" },
  { value: "general", label: "General question" },
] as const;
export const CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone call" },
  { value: "email", label: "Email" },
] as const;
export const VIEWING_ENQUIRIES = ["viewing", "virtual_viewing"];

const isOption = (list: readonly { value: string }[], x: string | undefined | null) => list.some((o) => o.value === x);

export function validateBuyerEnquiry(d: Values): FieldErrors {
  const e: FieldErrors = {};
  if (v(d.full_name).length < 2) e.full_name = "Enter your full name.";
  const em = emailError(d.email);
  if (em) e.email = em;
  if (!normalizePhone(d.phone)) e.phone = PHONE_HINT;
  if (!isOption(BUYER_TYPES, d.buyer_type)) e.buyer_type = "Choose the option that best describes you.";
  if (!isOption(ENQUIRY_TYPES, d.enquiry_type)) e.enquiry_type = "Choose what you would like from us.";
  if (!isOption(CONTACT_METHODS, d.preferred_contact)) e.preferred_contact = "Choose how we should contact you.";
  if (d.preferred_date && !/^\d{4}-\d{2}-\d{2}$/.test(v(d.preferred_date))) e.preferred_date = "Choose a date.";
  if (v(d.message).length > 2000) e.message = "Keep your message under 2,000 characters.";
  if (d.consent !== "on") e.consent = "Tick this box so we can contact you about your enquiry.";
  return e;
}

/** `askSegment`: the form shows the "I am a..." question (the consign form doesn't). */
export function validateInquiry(d: Values, askSegment = true): FieldErrors {
  const e: FieldErrors = {};
  if (v(d.full_name).length < 2) e.full_name = "Enter your full name.";
  const em = emailError(d.email);
  if (em) e.email = em;
  if (!normalizePhone(d.phone)) e.phone = PHONE_HINT;
  if (askSegment && !v(d.client_segment)) e.client_segment = "Choose the option that best describes you.";
  if (!v(d.service_division)) e.service_division = "Choose the service you are interested in.";
  if (v(d.message).length < 10) e.message = "Add a few words (at least 10 characters) about what you need.";
  if (d.consent !== "on") e.consent = "Tick this box so we can contact you about your enquiry.";
  return e;
}

export function validateNotify(d: Values): FieldErrors {
  const e: FieldErrors = {};
  const em = emailError(d.email);
  if (em) e.email = em;
  // Phone is optional (SMS / WhatsApp alerts); only checked when given.
  if (v(d.phone) && !normalizePhone(d.phone)) e.phone = PHONE_HINT;
  return e;
}

export function validateSignIn(d: Values): FieldErrors {
  const e: FieldErrors = {};
  const em = emailError(d.email);
  if (em) e.email = em;
  if (!d.password) e.password = "Enter your password.";
  return e;
}

/** `photos` is the number of uploaded photos; `currency` decides whether pence/cents are allowed. */
export function validateListing(d: Values, photos: number, currency: string): FieldErrors {
  const e: FieldErrors = {};
  const title = v(d.title);
  if (title.length < 5 || title.length > 100)
    e.title = "Enter a title between 5 and 100 characters, for example Victorian mahogany dining table.";
  if (!v(d.category)) e.category = "Choose the category that fits the item best.";
  const price = v(d.price);
  const priceOk = currency === "KES" ? /^\d+$/.test(price) : /^\d+(\.\d{1,2})?$/.test(price);
  if (!priceOk || Number(price) <= 0)
    e.price =
      currency === "KES"
        ? "Enter the price in whole shillings using numbers only, for example 25000. No commas or KES."
        : "Enter the price using numbers only, for example 250 or 249.99. No commas or $ sign.";
  if (v(d.location).length < 2) e.location = "Enter the town or area where buyers can view the item.";
  if (v(d.description).length > 2000) e.description = "Shorten the description to 2,000 characters or fewer.";
  if (photos < 1) e.photos = `Add at least 1 photo. ${PHOTO_RULES}`;
  return e;
}

export const hasErrors = (e: FieldErrors) => Object.keys(e).length > 0;
