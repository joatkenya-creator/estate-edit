import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchX, Tag } from "lucide-react";
import {
  EmptyState,
  ListingGridSkeleton,
  LotGridSkeleton,
  StatePanel,
} from "@/components/states/states";
import {
  ContactFallback,
  DraftNotice,
  ErrorSummary,
  FieldError,
  FormAlert,
  SERVER_ERROR,
  SuccessPanel,
} from "@/components/states/form-states";
import { CategoryEmpty } from "@/components/marketplace/category-browse";
import { categoryBySlug } from "@/lib/marketplace";
import { PHONE_HINT } from "@/lib/validation";

/**
 * Every interface state on one page, for design review at 375px and 1280px.
 * Development only: production builds answer 404. Show one with ?state=name.
 */
export const metadata: Metadata = { title: "UI states", robots: { index: false, follow: false } };

const STATES = ["loading", "empty", "error", "offline", "slow", "noresults", "forbidden", "expired", "validation", "success"] as const;

export default async function StatesPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { state } = await searchParams;
  const show = (s: string) => !state || state === s;
  const vehicles = categoryBySlug("vehicles")!;

  return (
    <main className="flex-1 bg-stone px-4 pb-16 pt-28 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-14">
        <nav className="flex flex-wrap gap-2 text-xs" aria-label="States">
          <Link href="/dev/states" className="rounded-full border border-border bg-white px-3 py-1.5">All</Link>
          {STATES.map((s) => (
            <Link
              key={s}
              href={`/dev/states?state=${s}`}
              className={`rounded-full border px-3 py-1.5 ${state === s ? "border-navy bg-navy text-white" : "border-border bg-white"}`}
            >
              {s}
            </Link>
          ))}
        </nav>

        {show("loading") && (
          <Section title="Loading">
            <LotGridSkeleton count={3} />
            <ListingGridSkeleton count={4} />
            <p className="text-xs text-charcoal/50">
              Full-page versions: navigate to /collection, /marketplace or a listing with network throttling on.
            </p>
          </Section>
        )}

        {show("empty") && (
          <Section title="Empty">
            <EmptyState
              title="No pieces in this category right now."
              body="New lots arrive as each estate is catalogued."
              action={{ label: "Get notified about new pieces", href: "#notify" }}
            />
            <CategoryEmpty category={vehicles} />
            <EmptyState
              icon={<Tag />}
              title="You haven't listed anything yet."
              body="Your first two listings are completely free."
              action={{ label: "Post your first listing", href: "/sell/post" }}
            />
          </Section>
        )}

        {show("error") && (
          <Section title="Error">
            <FormAlert>
              {SERVER_ERROR} <ContactFallback />
            </FormAlert>
            <Card>
              <StatePanel
                as="h2"
                eyebrow="No longer available"
                title="This piece has been sold or removed by its owner."
                primary={{ label: "See similar pieces", href: "/marketplace/furniture" }}
                secondary={{ label: "Browse the whole Marketplace", href: "/marketplace" }}
              >
                <p>Similar pieces are listed every week.</p>
              </StatePanel>
            </Card>
          </Section>
        )}

        {show("offline") && (
          <Section title="Offline">
            <p className="text-sm text-charcoal/60">
              The live banner appears under the header: switch DevTools Network to Offline to see it.
            </p>
            <FormAlert tone="info">
              You&apos;re offline, so your request is saved on this device. It will be sent
              automatically when you&apos;re back online. Keep this page open if you can.
            </FormAlert>
          </Section>
        )}

        {show("slow") && (
          <Section title="Slow network">
            <FormAlert tone="info">
              This is taking longer than usual.{" "}
              <span className="font-medium underline underline-offset-2">
                Save the listing with the 2 photos that have finished and add the rest later
              </span>
            </FormAlert>
            <div className="max-w-xs space-y-1 rounded-lg border border-border bg-white p-2 text-[0.7rem] text-charcoal/60">
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-deep">
                <div className="h-full w-[42%] bg-gold" />
              </div>
              <p className="flex justify-between">
                <span>42%</span>
                <span>812 KB</span>
              </p>
            </div>
          </Section>
        )}

        {show("noresults") && (
          <Section title="No search results">
            <p className="text-sm text-charcoal/75">
              Showing results for <em className="font-medium text-navy">mahogany</em> instead of <em>mahagony</em>.{" "}
              <span className="text-navy underline underline-offset-2">Search for mahagony instead</span>
            </p>
            <EmptyState
              icon={<SearchX />}
              title="No listings match “xylophone” right now."
              body="Try one of these, or we can tell you when something matching is listed."
              action={{ label: "Get notified when a match is listed", href: "#notify" }}
            />
          </Section>
        )}

        {show("forbidden") && (
          <Section title="Permission denied">
            <Card>
              <StatePanel
                as="h2"
                title="Sign in to post a listing"
                primary={{ label: "Sign in", href: "/auth/login?next=/sell/post" }}
                secondary={{ label: "Back to Marketplace", href: "/marketplace" }}
              >
                <p>We need to know who the seller is so buyers can contact you and we can vet listings.</p>
              </StatePanel>
            </Card>
            <Card>
              <StatePanel
                as="h2"
                eyebrow="Not in your account"
                title="This listing belongs to another account, or has been removed."
                primary={{ label: "Go to My Listings", href: "/account/listings" }}
              />
            </Card>
          </Section>
        )}

        {show("expired") && (
          <Section title="Session expired">
            <p className="rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
              You were signed out after a period of inactivity. Your listing draft was saved. Sign in
              to pick up where you left off.
            </p>
            <DraftNotice />
          </Section>
        )}

        {show("validation") && (
          <Section title="Form validation">
            <ErrorSummary
              errors={{ email: "x", phone: "x", consent: "x" }}
              labels={{ email: "Email", phone: "Phone", consent: "Consent to contact you" }}
            />
            <div className="max-w-sm space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-charcoal/70">Phone</label>
              <input aria-invalid className="h-8 w-full rounded-lg border border-crimson bg-white px-2.5 text-sm" defaultValue="0712 34" />
              <FieldError name="demo-phone" message={PHONE_HINT} />
            </div>
          </Section>
        )}

        {show("success") && (
          <Section title="Success">
            <Card>
              <SuccessPanel
                title="Thank you, Jane. Your consultation request has been received."
                action={{ label: "Browse the Collection", href: "/collection" }}
              >
                <p>
                  We&apos;ll reply to <span className="font-medium text-navy">jane@email.com</span>. Your
                  details are kept in strict confidence and never shared.
                </p>
                <p>Our concierge team will contact you within one business day by phone or email.</p>
              </SuccessPanel>
            </Card>
            <div className="rounded-2xl bg-navy px-6 py-10">
              <SuccessPanel tone="dark" title="You're on the list.">
                <p>We&apos;ll message you by email when new pieces arrive. You can unsubscribe at any time.</p>
              </SuccessPanel>
            </div>
          </Section>
        )}
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="eyebrow">{title}</h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-white px-5 py-10 shadow-sm">{children}</div>;
}
