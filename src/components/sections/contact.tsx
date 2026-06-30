"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
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

const initialState: InquiryState = { status: "idle", message: "" };

export type InquiryAsset = {
  slug: string;
  title: string;
  category?: string;
};

export function Contact({ asset }: { asset?: InquiryAsset }) {
  // When the lead arrives from a specific catalogue item, default to the asset
  // review flow and pre-fill the message referencing that item.
  const [type, setType] = useState<"consultation" | "asset_review">(
    asset ? "asset_review" : "consultation",
  );
  const [state, formAction, isPending] = useActionState(submitInquiry, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const { region } = useRegion();
  const location = regionContent[region].location;
  const contactInfo = [
    { icon: Phone, label: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s+/g, "")}` },
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
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <section id="contact" className="relative overflow-hidden bg-white py-24 sm:py-32">
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
              </span>
            </div>
          )}

          <form ref={formRef} action={formAction} className="grid gap-5">
            <input type="hidden" name="inquiry_type" value={type} />
            {asset && (
              <>
                <input type="hidden" name="asset_slug" value={asset.slug} />
                <input type="hidden" name="asset_title" value={asset.title} />
                {asset.category && (
                  <input type="hidden" name="asset_category" value={asset.category} />
                )}
              </>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="full_name" required>
                <Input id="full_name" name="full_name" placeholder="Jane Mwangi" required />
              </Field>
              <Field label="Email" htmlFor="email" required>
                <Input id="email" name="email" type="email" placeholder="jane@email.com" required />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" htmlFor="phone" required>
                <PhoneField id="phone" name="phone" required />
              </Field>
              <Field label="Location" htmlFor="location">
                <Input id="location" name="location" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="I am a…" htmlFor="client_segment">
                <Select name="client_segment">
                  <SelectTrigger id="client_segment" className="w-full">
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
              <Field label="Service of interest" htmlFor="service_division">
                <Select name="service_division">
                  <SelectTrigger id="service_division" className="w-full">
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
                required
              />
            </Field>

            <label className="flex items-start gap-3 text-xs text-muted-foreground">
              <input
                type="checkbox"
                name="consent"
                className="mt-0.5 size-4 rounded border-border accent-[var(--navy)]"
              />
              I consent to The Estate Edit contacting me about my enquiry.
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="group h-13 bg-navy text-white hover:bg-navy-soft disabled:opacity-70"
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
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wide text-charcoal/70">
        {label}
        {required && <span className="text-crimson"> *</span>}
      </Label>
      {children}
    </div>
  );
}
