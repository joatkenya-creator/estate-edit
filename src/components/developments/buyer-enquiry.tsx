"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneField } from "@/components/forms/phone-field";
import { submitBuyerEnquiry } from "@/app/actions/buyer-enquiry";
import type { InquiryState } from "@/app/actions/inquiry";
import {
  BUYER_TYPES,
  CONTACT_METHODS,
  ENQUIRY_TYPES,
  VIEWING_ENQUIRIES,
  validateBuyerEnquiry,
} from "@/lib/validation";
import {
  ContactFallback,
  ErrorSummary,
  FieldError,
  FormAlert,
  SuccessPanel,
  useFieldErrors,
  useSubmit,
} from "@/components/states/form-states";

const initialState: InquiryState = { status: "idle", message: "" };

const LABELS: Record<string, string> = {
  full_name: "Full name",
  email: "Email",
  phone: "Phone",
  buyer_type: "I am",
  enquiry_type: "I would like",
  preferred_contact: "Contact me by",
  preferred_date: "Preferred date",
  message: "Message",
  consent: "Consent",
};

const SUBMIT_LABEL: Record<string, string> = {
  price_list: "Request price list",
  brochure: "Request brochure",
  viewing: "Request a viewing",
  virtual_viewing: "Request a virtual viewing",
  payment_plan: "Request payment plan",
  reservation: "Request to reserve",
  general: "Send enquiry",
};

const select =
  "h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-charcoal focus-visible:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

export type BuyerEnquiryProps = {
  development: { slug: string; name: string; developerLegalName: string };
  unitTypes: { slug: string; name: string }[];
  unit?: string;
  enquiry?: string;
};

export function BuyerEnquiry({ development, unitTypes, unit, enquiry }: BuyerEnquiryProps) {
  const [type, setType] = useState(ENQUIRY_TYPES.some((e) => e.value === enquiry) ? enquiry! : "price_list");
  const [state, submit, isPending] = useSubmit(submitBuyerEnquiry, initialState);
  const v = useFieldErrors(validateBuyerEnquiry);

  useEffect(() => {
    if (state.status === "error") v.showErrors(state.fieldErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!v.validateAll(e.currentTarget)) return;
    submit(new FormData(e.currentTarget));
  }

  if (state.status === "success") {
    return <SuccessPanel title={state.message} action={{ label: `Back to ${development.name}`, href: `/developments/${development.slug}` }} />;
  }

  const viewing = VIEWING_ENQUIRIES.includes(type);

  return (
    <form onSubmit={onSubmit} {...v.formProps} className="grid gap-5">
      {v.summary && <ErrorSummary errors={v.errors} labels={LABELS} />}
      {state.status === "error" && !state.fieldErrors && (
        <FormAlert>
          {state.message} <ContactFallback />
        </FormAlert>
      )}
      <input type="hidden" name="development" value={development.slug} />
      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="I would like" name="enquiry_type" required error={v.errors.enquiry_type}>
          <select id="enquiry_type" name="enquiry_type" className={select} value={type} onChange={(e) => setType(e.target.value)} {...v.a11y("enquiry_type")}>
            {ENQUIRY_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Home type" name="unit">
          <select id="unit" name="unit" className={select} defaultValue={unit ?? ""}>
            <option value="">Any / not sure yet</option>
            {unitTypes.map((u) => (
              <option key={u.slug} value={u.slug}>{u.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="full_name" required error={v.errors.full_name}>
          <Input id="full_name" name="full_name" autoComplete="name" {...v.a11y("full_name")} />
        </Field>
        <Field label="Email" name="email" required error={v.errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" {...v.a11y("email")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone (any country)" name="phone" required error={v.errors.phone}>
          <PhoneField id="phone" name="phone" invalid={Boolean(v.errors.phone)} />
        </Field>
        <Field label="Contact me by" name="preferred_contact" required error={v.errors.preferred_contact}>
          <select id="preferred_contact" name="preferred_contact" className={select} defaultValue="whatsapp" {...v.a11y("preferred_contact")}>
            {CONTACT_METHODS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="I am" name="buyer_type" required error={v.errors.buyer_type}>
        <select id="buyer_type" name="buyer_type" className={select} defaultValue="" {...v.a11y("buyer_type")}>
          <option value="" disabled>Select</option>
          {BUYER_TYPES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      {viewing && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preferred date" name="preferred_date" error={v.errors.preferred_date}>
            <Input id="preferred_date" name="preferred_date" type="date" min={new Date().toISOString().slice(0, 10)} {...v.a11y("preferred_date")} />
          </Field>
          <Field label="Preferred time" name="preferred_time">
            <select id="preferred_time" name="preferred_time" className={select} defaultValue="">
              <option value="">Any time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </Field>
        </div>
      )}

      <Field label="Message (optional)" name="message" error={v.errors.message}>
        <Textarea id="message" name="message" rows={3} {...v.a11y("message")} />
      </Field>

      <div className="grid gap-2">
        <label htmlFor="consent" className="flex items-start gap-3 text-xs text-muted-foreground">
          <input id="consent" type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0 accent-[var(--navy)]" {...v.a11y("consent")} />
          <span>
            I consent to The Estate Edit and {development.developerLegalName} contacting me about this enquiry, and to
            The Estate Edit sharing my details with {development.developerLegalName} for that purpose.
            <span className="text-crimson" aria-hidden> *</span>
          </span>
        </label>
        <FieldError name="consent" message={v.errors.consent} />
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="group h-13 w-full bg-navy text-white hover:bg-navy-soft disabled:opacity-70">
        {isPending ? "Sending…" : SUBMIT_LABEL[type]}
        {!isPending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-charcoal/70">
        {label}
        {required && <span className="text-crimson" aria-hidden> *</span>}
      </Label>
      {children}
      <FieldError name={name} message={error} />
    </div>
  );
}
