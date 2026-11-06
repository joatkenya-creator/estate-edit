"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneField } from "@/components/forms/phone-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { clientSegments, serviceOptions, siteConfig, regionContent } from "@/lib/site";
import { useRegion } from "@/components/region/region-context";
import { validateInquiry } from "@/lib/validation";
import {
  ContactFallback,
  DraftNotice,
  ErrorSummary,
  FieldError,
  FormAlert,
  SuccessPanel,
  useDraft,
  useFieldErrors,
  useOnline,
  useOutbox,
  useSlow,
  useSubmit,
} from "@/components/states/form-states";

const initialState: InquiryState = { status: "idle", message: "" };

const LABELS: Record<string, string> = {
  full_name: "Full name",
  email: "Email",
  phone: "Phone",
  client_segment: "I am a...",
  service_division: "Service of interest",
  message: "How can we help?",
  consent: "Consent to contact you",
};

export type InquiryAsset = {
  slug: string;
  title: string;
  category?: string;
  /** Residences: the company listing it, so the lead can be routed to them. */
  listedBy?: { slug: string; name: string };
};

export function Contact({ asset }: { asset?: InquiryAsset }) {
  // When the lead arrives from a specific catalogue item, default to the asset
  // review flow and pre-fill the message referencing that item.
  const [type, setType] = useState<"consultation" | "asset_review">(
    asset ? "asset_review" : "consultation",
  );
  const [state, submit, isPending, setState] = useSubmit(submitInquiry, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const online = useOnline();
  const slow = useSlow(isPending);
  const v = useFieldErrors(validateInquiry);
  // The long free-text fields are what hurts to lose; phone and selects are quick to redo.
  const draft = useDraft(`ee:draft:contact${asset ? `:${asset.slug}` : ""}`, formRef, {
    fields: ["full_name", "email", "location", "message"],
  });
  // What the visitor sent, for the confirmation panel.
  const [sent, setSent] = useState<{ name: string; email: string; type: string } | null>(null);

  // A request made offline waits on this device and goes out on reconnect.
  const outbox = useOutbox("ee:outbox:inquiry", async (fields) => {
    const fd = new FormData();
    for (const [k, val] of Object.entries(fields)) fd.set(k, val);
    const result = await submitInquiry(initialState, fd);
    if (result.status !== "success") return false;
    setSent({ name: fields.full_name ?? "", email: fields.email ?? "", type: fields.inquiry_type ?? "consultation" });
    setState(result);
    draft.clear();
    return true;
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!v.validateAll(form)) return;
    const fd = new FormData(form);
    setSent({ name: String(fd.get("full_name")), email: String(fd.get("email")), type });
    if (!navigator.onLine) {
      outbox.enqueue(form);
      return;
    }
    submit(fd);
  }

  const { region } = useRegion();
  const location = regionContent[region].location;
  const contactInfo = [
    // Virginia store: no phone shown — email + location only.
    ...(region !== "virginia"
      ? [{ icon: Phone, label: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s+/g, "")}` }]
      : []),
    { icon: Mail, label: siteConfig.email, href: `mailto:${siteConfig.email}` },
    {
      icon: MapPin,
      label: location,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
    },
  ];

  const assetPrefill = asset
    ? `I'm interested in "${asset.title}"${
        asset.category ? ` (${asset.category})` : ""
      }. Please share more details and availability.`
    : undefined;

  useEffect(() => {
    if (state.status === "success") draft.clear();
    // Field errors the server caught are shown inline, exactly like the browser's.
    if (state.status === "error") v.showErrors(state.fieldErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  const done = state.status === "success" && sent;

  return (
    <section id="contact" className="relative overflow-hidden bg-white pb-4 pt-24 sm:pb-6 sm:pt-32">
      <div className="pointer-events-none absolute -left-32 top-10 hidden size-96 rounded-full bg-stone blur-3xl sm:block" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Editorial column */}
        <div className="flex flex-col">
          <p className="eyebrow mb-4">Begin the conversation</p>
          <h2 className="font-display text-4xl font-light leading-tight text-navy sm:text-5xl text-balance">
            Ready to simplify your transition?
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground text-pretty">
            Every engagement begins with a private, no-obligation consultation. Share a few
            details and our concierge team will respond within one business day.
          </p>

          <div className="mt-10 space-y-4">
            {contactInfo.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex items-center gap-3 text-charcoal transition-colors hover:text-navy"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-stone text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                  <Icon className="size-4.5" strokeWidth={1.6} />
                </span>
                <span className="text-sm">{label}</span>
              </a>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-lg border border-border bg-stone/60 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.6} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Complete discretion is guaranteed. Your details are never shared, and consultations
              are handled in the strictest confidence.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_30px_80px_-50px_rgba(0,35,73,0.4)] sm:p-9">
          {done ? (
            <SuccessPanel
              title={`Thank you, ${done.name.trim().split(/\s+/)[0]}. Your ${
                done.type === "asset_review" ? "asset review request" : "consultation request"
              } has been received.`}
              action={{ label: "Browse the Collection", href: "/collection" }}
            >
              <p>
                We&apos;ll reply to <span className="font-medium text-navy">{done.email}</span>. Your
                details are kept in strict confidence and never shared.
              </p>
              {done.type === "asset_review" ? (
                <p>
                  Next, our team reviews what you&apos;ve described, contacts you within one
                  business day by phone or email to arrange a viewing, then shares how we would
                  value and sell the assets.
                </p>
              ) : (
                <p>Our concierge team will contact you within one business day by phone or email.</p>
              )}
            </SuccessPanel>
          ) : (
          <>
          {/* Inquiry type toggle */}
          <div className="mb-7 grid grid-cols-2 gap-2 rounded-lg bg-stone p-1.5">
            {(
              [
                { key: "consultation", label: "Book a Consultation" },
                { key: "asset_review", label: "Request an Asset Review" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setType(opt.key)}
                className={cn(
                  "rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-300",
                  type === opt.key
                    ? "bg-navy text-white shadow-sm"
                    : "text-charcoal/70 hover:text-navy",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {asset && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
              <ShieldCheck className="size-4 shrink-0 text-gold" strokeWidth={1.8} />
              <span>
                Enquiring about <span className="font-medium">{asset.title}</span>
                {asset.category ? ` · ${asset.category}` : ""}
                {asset.listedBy ? ` · listed by ${asset.listedBy.name}` : ""}
              </span>
            </div>
          )}

          <form ref={formRef} onSubmit={onSubmit} {...v.formProps} className="grid gap-5">
            {draft.restored && <DraftNotice onDiscard={draft.discard} />}
            {v.summary && <ErrorSummary errors={v.errors} labels={LABELS} />}
            {outbox.queued && (
              <FormAlert tone="info">
                You&apos;re offline, so your request is saved on this device. It will be sent
                automatically when you&apos;re back online. Keep this page open if you can.
              </FormAlert>
            )}
            {state.status === "error" && !state.fieldErrors && (
              <FormAlert>
                {state.message} <ContactFallback />
              </FormAlert>
            )}
            <input type="hidden" name="inquiry_type" value={type} />
            {asset && (
              <>
                <input type="hidden" name="asset_slug" value={asset.slug} />
                <input type="hidden" name="asset_title" value={asset.title} />
                {asset.category && (
                  <input type="hidden" name="asset_category" value={asset.category} />
                )}
                {asset.listedBy && (
                  <input type="hidden" name="asset_listed_by" value={asset.listedBy.slug} />
                )}
              </>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="full_name" required error={v.errors.full_name}>
                <Input id="full_name" name="full_name" autoComplete="name" placeholder="Jane Mwangi" {...v.a11y("full_name")} />
              </Field>
              <Field label="Email" htmlFor="email" required error={v.errors.email}>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="jane@email.com" {...v.a11y("email")} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" htmlFor="phone" required error={v.errors.phone}>
                <PhoneField id="phone" name="phone" invalid={Boolean(v.errors.phone)} />
              </Field>
              <Field label="Location" htmlFor="location">
                <Input id="location" name="location" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="I am a…" htmlFor="client_segment" required error={v.errors.client_segment}>
                <Select name="client_segment">
                  <SelectTrigger id="client_segment" className="w-full" {...v.a11y("client_segment")}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientSegments.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Service of interest" htmlFor="service_division" required error={v.errors.service_division}>
                <Select name="service_division">
                  <SelectTrigger id="service_division" className="w-full" {...v.a11y("service_division")}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field
              label={type === "asset_review" ? "Describe the assets" : "How can we help?"}
              htmlFor="message"
              required
              error={v.errors.message}
            >
              <Textarea
                id="message"
                name="message"
                rows={4}
                defaultValue={assetPrefill}
                placeholder={
                  type === "asset_review"
                    ? "Tell us about the estate, vehicles, art, or equipment for review…"
                    : "A few words about your transition and timeline…"
                }
                {...v.a11y("message")}
              />
            </Field>

            <div className="grid gap-2">
              <label htmlFor="consent" className="flex items-start gap-3 text-xs text-muted-foreground">
                <input
                  id="consent"
                  type="checkbox"
                  name="consent"
                  className="mt-0.5 size-4 shrink-0 rounded border-border accent-[var(--navy)]"
                  {...v.a11y("consent")}
                />
                <span>
                  I consent to The Estate Edit contacting me about my enquiry.
                  <span className="text-crimson" aria-hidden> *</span>
                </span>
              </label>
              <FieldError name="consent" message={v.errors.consent} />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isPending || outbox.queued}
              className="group h-13 w-full bg-navy text-white hover:bg-navy-soft disabled:opacity-70"
            >
              {isPending
                ? "Sending…"
                : type === "asset_review"
                  ? "Request Asset Review"
                  : "Book Consultation"}
              {!isPending && (
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
            {slow && (
              <p role="status" className="text-center text-xs text-charcoal/70">
                This is taking longer than usual.{" "}
                <a
                  href={`https://wa.me/${siteConfig.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-navy underline underline-offset-2"
                >
                  Send us a message on WhatsApp instead
                </a>
              </p>
            )}
            {!online && !outbox.queued && (
              <p role="status" className="text-center text-xs text-charcoal/70">
                You&apos;re offline. You can still send this: it will be held on this device and
                go out when you reconnect.
              </p>
            )}
          </form>
          </>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wide text-charcoal/70">
        {label}
        {required && <span className="text-crimson" aria-hidden> *</span>}
      </Label>
      {children}
      <FieldError name={htmlFor} message={error} />
    </div>
  );
}
