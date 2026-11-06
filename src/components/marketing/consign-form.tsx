"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { getUtm } from "@/lib/utm";
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
  useSubmit,
} from "@/components/states/form-states";

const initial: InquiryState = { status: "idle", message: "" };
const validate = (d: Record<string, string>) => validateInquiry(d, false);
const LABELS: Record<string, string> = {
  full_name: "Full name",
  phone: "Phone",
  email: "Email",
  message: "What are you looking to sell?",
  consent: "Consent to contact you",
};

/** Supply-side lead form — routes to the inquiries CRM as an asset_review, tagged
 * source=sell_with_us with first-touch UTM. */
export function ConsignForm() {
  const [state, submit, pending] = useSubmit(submitInquiry, initial);
  const [utm, setUtm] = useState("{}");
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const v = useFieldErrors(validate);
  const draft = useDraft("ee:draft:consign", formRef, {
    fields: ["full_name", "phone", "email", "location", "message"],
  });

  useEffect(() => {
    setUtm(JSON.stringify(getUtm()));
  }, []);

  useEffect(() => {
    if (state.status === "success") draft.clear();
    if (state.status === "error") v.showErrors(state.fieldErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.status === "success" && sent) {
    return (
      <SuccessPanel
        title={`Thank you, ${sent.name.trim().split(/\s+/)[0]}. Your valuation request has been received.`}
        action={{ label: "Browse the Collection", href: "/collection" }}
      >
        <p>
          We&apos;ll reply to <span className="font-medium text-navy">{sent.email}</span>. Your
          details are kept in strict confidence and never shared.
        </p>
        <p>
          Next, we review what you&apos;ve described, contact you within one business day to
          arrange a viewing, then share how we would value and sell it.
        </p>
      </SuccessPanel>
    );
  }

  return (
    <form
      ref={formRef}
      {...v.formProps}
      onSubmit={(e) => {
        e.preventDefault();
        if (!v.validateAll(e.currentTarget)) return;
        const fd = new FormData(e.currentTarget);
        setSent({ name: String(fd.get("full_name")), email: String(fd.get("email")) });
        submit(fd);
      }}
      className="grid gap-5"
    >
      <input type="hidden" name="inquiry_type" value="asset_review" />
      <input type="hidden" name="service_division" value="estate_sales" />
      <input type="hidden" name="source" value="sell_with_us" />
      <input type="hidden" name="utm" value={utm} />

      {draft.restored && <DraftNotice onDiscard={draft.discard} />}
      {v.summary && <ErrorSummary errors={v.errors} labels={LABELS} />}
      {state.status === "error" && !state.fieldErrors && (
        <FormAlert>
          {state.message} <ContactFallback />
        </FormAlert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name *</Label>
          <Input id="full_name" name="full_name" autoComplete="name" placeholder="Jane Mwangi" {...v.a11y("full_name")} />
          <FieldError name="full_name" message={v.errors.full_name} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" {...v.a11y("phone")} />
          <FieldError name="phone" message={v.errors.phone} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="jane@email.com" {...v.a11y("email")} />
          <FieldError name="email" message={v.errors.email} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Karen, Nairobi / Richmond, VA" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">What are you looking to sell? *</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us about the items or estate: type, quantity, condition, approx. value, and timeline."
          {...v.a11y("message")}
        />
        <FieldError name="message" message={v.errors.message} />
      </div>

      <div className="grid gap-2">
        <label htmlFor="consent" className="flex items-start gap-2 text-xs text-muted-foreground">
          <input id="consent" type="checkbox" name="consent" className="mt-0.5" defaultChecked {...v.a11y("consent")} />
          <span>I agree to be contacted about my enquiry.</span>
        </label>
        <FieldError name="consent" message={v.errors.consent} />
      </div>

      <Button type="submit" disabled={pending} size="lg" className="h-12 w-full bg-navy text-white hover:bg-navy-soft">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> Sending…
          </>
        ) : (
          "Request a valuation"
        )}
      </Button>
    </form>
  );
}
