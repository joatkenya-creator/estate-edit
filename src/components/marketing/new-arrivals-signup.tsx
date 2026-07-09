"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPublicClient } from "@/lib/supabase/public";
import { useRegion } from "@/components/region/region-context";
import { getUtm } from "@/lib/utm";

/**
 * New-arrivals alert capture — builds the lead list (email + optional phone for
 * Kenya SMS/WhatsApp). Inserts into `subscribers` via the anon key (RLS
 * insert-only), tagged with the visitor's market.
 */
export function NewArrivalsSignup({ source = "new-arrivals" }: { source?: string }) {
  const { region } = useRegion();
  const isKe = region === "kenya";
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createPublicClient();
      const utm = getUtm();
      const { error } = await supabase.from("subscribers").insert({
        email: email.trim(),
        phone: phone.trim() || null,
        market: region,
        source,
        metadata: Object.keys(utm).length ? utm : null,
      });
      if (error) throw new Error(error.message);
      setDone(true);
      toast.success("You're on the list — we'll alert you to new arrivals.");
    } catch {
      toast.error("Couldn't subscribe just now. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="overflow-hidden rounded-2xl bg-navy px-6 py-10 text-center sm:px-12 sm:py-12">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/10 text-gold">
          <BellRing className="size-6" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 font-display text-2xl text-white sm:text-3xl text-balance">
          First access to new arrivals
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
          {isKe
            ? "Be the first to know when we list new pieces — by email, SMS or WhatsApp."
            : "Get an email the moment new pieces are listed — before they're gone."}
        </p>

        {done ? (
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold-soft">
            <CheckCircle2 className="size-4" /> You&apos;re subscribed. Watch your inbox.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="h-11 flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/40"
            />
            {isKe && (
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7… (optional)"
                aria-label="Phone for SMS/WhatsApp alerts"
                className="h-11 flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/40"
              />
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 bg-gold px-6 text-navy hover:bg-gold-soft"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : "Notify me"}
            </Button>
          </form>
        )}
        <p className="mt-3 text-xs text-white/40">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
