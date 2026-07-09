"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { getUtm } from "@/lib/utm";

const initial: InquiryState = { status: "idle", message: "" };

/** Supply-side lead form — routes to the inquiries CRM as an asset_review, tagged
 * source=sell_with_us with first-touch UTM. */
export function ConsignForm() {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const [utm, setUtm] = useState("{}");

  useEffect(() => {
    setUtm(JSON.stringify(getUtm()));
  }, []);

  useEffect(() => {
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-green-600" />
        <h3 className="mt-3 font-display text-xl text-navy">Thank you</h3>
        <p className="mt-2 text-sm text-charcoal/70">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="inquiry_type" value="asset_review" />
      <input type="hidden" name="service_division" value="estate_sales" />
      <input type="hidden" name="source" value="sell_with_us" />
      <input type="hidden" name="utm" value={utm} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name *</Label>
          <Input id="full_name" name="full_name" required placeholder="Jane Mwangi" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" name="phone" required placeholder="+254 7…" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="jane@email.com" />
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
          required
          rows={4}
          placeholder="Tell us about the items or estate — type, quantity, condition, approx. value, and timeline."
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="consent" className="mt-0.5" defaultChecked />
        <span>I agree to be contacted about my enquiry.</span>
      </label>

      <Button type="submit" disabled={pending} size="lg" className="h-12 bg-navy text-white hover:bg-navy-soft">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          "Request a valuation"
        )}
      </Button>
    </form>
  );
}
