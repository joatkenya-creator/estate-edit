import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Tag, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getRegion } from "@/lib/region.server";
import { regionContent } from "@/lib/site";
import { regionCurrency } from "@/lib/region";
import { buildOpenGraph, regionAlternates } from "@/lib/seo";

// Region-aware copy + listing-fee pricing — render per request.
export const dynamic = "force-dynamic";

const sellTitle = "Sell on The Estate Edit";
const sellDescription = "Post your luxury and estate items for sale. Your first two listings are free.";

export async function generateMetadata(): Promise<Metadata> {
  const region = await getRegion();
  return {
    title: sellTitle,
    description: sellDescription,
    alternates: regionAlternates("/sell", region),
    openGraph: buildOpenGraph({ title: sellTitle, description: sellDescription, path: "/sell", region }),
  };
}

const STEPS = [
  {
    step: "1",
    title: "Create your account",
    body: "Sign up in seconds. Verification is not required to post your first listing.",
  },
  {
    step: "2",
    title: "Post your item",
    body: "Fill in the title, photos, price, and description. Your first two listings are completely free.",
  },
  {
    step: "3",
    title: "Get reviewed",
    body: "Our team reviews your listing for quality. Most listings go live within 24 hours.",
  },
];

const PERKS = [
  { icon: Tag, title: "2 free listings", body: "Post your first two items at no cost." },
  { icon: Shield, title: "Moderation", body: "Every listing is reviewed to keep quality high." },
];

export default async function SellPage() {
  const region = await getRegion();
  const currency = regionCurrency[region];
  const listingFee = region === "virginia" ? 8 : 500;
  const place = regionContent[region].place;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let freeRemaining = 2;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("free_listings_used")
      .eq("id", user.id)
      .single();
    freeRemaining = Math.max(0, 2 - (profile?.free_listings_used ?? 0));
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy py-24 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Sell your estate items <br className="hidden sm:block" />
            <span className="text-gold">on The Estate Edit</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
            Reach discerning buyers across {place}. Your first two listings are free.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-soft">
                <Link href="/sell/post">
                  Post a listing
                  {freeRemaining > 0 && (
                    <span className="ml-2 rounded-full bg-navy/20 px-2 py-0.5 text-xs">
                      {freeRemaining} free
                    </span>
                  )}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-soft">
                  <Link href="/auth/signup">
                    Create free account <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-stone py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-2">
            {PERKS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-white p-6 shadow-sm text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-navy/5">
                  <Icon className="size-5 text-navy" />
                </div>
                <h3 className="font-semibold text-navy">{title}</h3>
                <p className="mt-1 text-sm text-charcoal/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center font-display text-3xl text-navy">How it works</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="flex gap-4 rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-navy">{title}</h3>
                  <p className="mt-1 text-sm text-charcoal/60">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-stone py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center font-display text-3xl text-navy">Simple, fair pricing</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Free tier */}
            <div className="rounded-xl border-2 border-green-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl text-navy">Free starter</h3>
              <p className="mt-1 text-3xl font-bold text-green-700">{currency} 0</p>
              <p className="mt-0.5 text-sm text-charcoal/60">per listing · first 2 listings</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "First 2 listings at no cost",
                  "Active on the marketplace",
                  "Buyers contact you directly",                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Paid tier */}
            <div className="rounded-xl border-2 border-navy bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl text-navy">Seller tier</h3>
              <p className="mt-1 text-3xl font-bold text-navy">{currency} {listingFee}</p>
              <p className="mt-0.5 text-sm text-charcoal/60">per listing · from 3rd listing onwards</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  `Unlimited listings at ${currency} ${listingFee} each`,
                  "Priority review",
                  "Buyers contact you directly",                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-navy" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="font-display text-3xl text-navy">Ready to sell?</h2>
          <p className="mt-3 text-charcoal/60">
            Join sellers who trust The Estate Edit to find buyers for their most valued items.
          </p>
          <Button asChild size="lg" className="mt-6 bg-navy text-white hover:bg-navy-soft">
            <Link href={user ? "/sell/post" : "/auth/signup"}>
              {user ? "Post a listing" : "Get started for free"}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
