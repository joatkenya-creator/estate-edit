"use client";

import { useRef, useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPublicClient } from "@/lib/supabase/public";
import { useRegion } from "@/components/region/region-context";
import { getUtm } from "@/lib/utm";
import { normalizePhone, validateNotify } from "@/lib/validation";
import {
  FieldError,
  SuccessPanel,
  useFieldErrors,
  useOutbox,
  useOnline,
} from "@/components/states/form-states";

/** Anchor that empty states scroll to ("Get notified about new pieces"). */
export const NOTIFY_ANCHOR = "notify";

/**
 * New-arrivals alert capture — builds the lead list (email + optional phone for
 * Kenya SMS/WhatsApp). Inserts into `subscribers` via the anon key (RLS
 * insert-only), tagged with the visitor's market. Given a `searchTerm`, the
 * signup also records what the visitor searched for and found nothing.
 */
export function NewArrivalsSignup({
  source = "new-arrivals",
  searchTerm,
  closing = false,
}: {
  source?: string;
  searchTerm?: string;
  /** Last section before the footer: trims the bottom padding to match the CTA band. */
  closing?: boolean;
}) {
  const { region } = useRegion();
  const isKe = region === "kenya";
  const online = useOnline();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<{ phone: boolean } | null>(null);
  const v = useFieldErrors(validateNotify);

  async function insert(fields: Record<string, string>) {
    const supabase = createPublicClient();
    const utm = getUtm();
    const metadata = { ...utm, ...(searchTerm ? { search: searchTerm } : {}) };
    const { error } = await supabase.from("subscribers").insert({
      email: fields.email.trim(),
      phone: normalizePhone(fields.phone),
      market: region,
      source,
      metadata: Object.keys(metadata).length ? metadata : null,
    });
    if (error) throw new Error(error.message);
    setDone({ phone: Boolean(fields.phone?.trim()) });
  }

  const outbox = useOutbox(`ee:outbox:notify:${source}`, async (fields) => {
    await insert(fields);
    return true;
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!v.validateAll(form)) return;
    if (!navigator.onLine) return outbox.enqueue(form);
    setSubmitting(true);
    setFailed(false);
    try {
      await insert(Object.fromEntries(new FormData(form)) as Record<string, string>);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  const channel = done?.phone ? "email, SMS or WhatsApp" : "email";

  return (
    <section
      id={NOTIFY_ANCHOR}
      className={`mx-auto max-w-7xl scroll-mt-28 px-5 pt-14 sm:px-8 ${closing ? "pb-4 sm:pb-6" : "pb-14"}`}
    >
      <div className="overflow-hidden rounded-2xl bg-navy px-6 py-10 text-center sm:px-12 sm:py-12">
        {done ? (
          <SuccessPanel tone="dark" title="You're on the list.">
            <p>
              We&apos;ll message you by {channel} when new pieces
              {searchTerm ? ` matching “${searchTerm}”` : ""} arrive. You can unsubscribe at any
              time.
            </p>
          </SuccessPanel>
        ) : (
          <>
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/10 text-gold">
              <BellRing className="size-6" strokeWidth={1.6} />
            </span>
            <h2 className="mt-5 font-display text-2xl text-white sm:text-3xl text-balance">
              {searchTerm ? "Get notified when a match is listed" : "First access to new arrivals"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
              {searchTerm
                ? `We'll tell you when someone lists something matching “${searchTerm}”.`
                : isKe
                  ? "Be the first to know when we list new pieces, by email, SMS or WhatsApp."
                  : "Get an email the moment new pieces are listed, before they're gone."}
            </p>

            <form
              ref={formRef}
              {...v.formProps}
              onSubmit={onSubmit}
              className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 text-left sm:flex-row sm:items-start"
            >
              <div className="flex-1 space-y-1.5">
                <Input
                  id={`${NOTIFY_ANCHOR}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="h-11 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                  {...v.a11y("email")}
                  aria-describedby={v.errors.email ? "email-error" : undefined}
                />
                <NotifyError name="email" message={v.errors.email} />
              </div>
              {isKe && (
                <div className="flex-1 space-y-1.5">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="0712 345 678 (optional)"
                    aria-label="Phone for SMS or WhatsApp alerts (optional)"
                    className="h-11 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    {...v.a11y("phone")}
                  />
                  <NotifyError name="phone" message={v.errors.phone} />
                </div>
              )}
              <Button
                type="submit"
                disabled={submitting || outbox.queued}
                className="h-11 min-w-28 bg-gold px-6 text-navy hover:bg-gold-soft"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                    <span>Sending…</span>
                  </>
                ) : (
                  "Notify me"
                )}
              </Button>
            </form>

            <div aria-live="polite" className="mx-auto mt-3 max-w-md text-xs">
              {failed && (
                <p className="text-white/85">
                  Something went wrong on our side and you weren&apos;t added. Your details are still
                  here. Please try again.
                </p>
              )}
              {outbox.queued && (
                <p className="text-gold-soft">
                  You&apos;re offline. We saved your details and will sign you up when you&apos;re back
                  online.
                </p>
              )}
              {!online && !outbox.queued && (
                <p className="text-white/60">You&apos;re offline. You can still sign up: we&apos;ll send it when you reconnect.</p>
              )}
            </div>
            <p className="mt-3 text-xs text-white/40">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </section>
  );
}

/** FieldError, recoloured for the navy panel. */
function NotifyError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <div className="[&_p]:text-gold-soft">
      <FieldError name={name} message={message} />
    </div>
  );
}
