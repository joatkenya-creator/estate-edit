import type { Metadata } from "next";
import Link from "next/link";
import { Truck, MapPin, Wallet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDeliverySettings } from "@/lib/queries";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Delivery & Returns",
  description:
    "How The Estate Edit delivers countrywide across Kenya: delivery fees, timelines, payment on delivery, and returns.",
  alternates: { canonical: "/delivery" },
};

/** Fallback copy shown when the CMS `details` field is empty. */
const DEFAULT_DETAILS = [
  "We deliver purchased items to every county in Kenya. Delivery is arranged after you place an order. Our team calls or WhatsApps you to confirm the details and timing.",
  "Delivery fees are calculated at checkout based on your county (distance) and the size, weight and fragility of the item. You'll always see the exact fee before you confirm.",
  "Payment is made on delivery, by cash or M-Pesa, once your items arrive and you're satisfied. No payment is taken online.",
  "If an item arrives damaged or not as described, contact us within 48 hours of delivery and we'll arrange a replacement or resolution.",
];

const points = [
  { icon: MapPin, title: "Countrywide", body: "All 47 counties, from Nairobi to the coast and upcountry." },
  { icon: Truck, title: "Fee by county & item", body: "Distance plus the item's size, weight and fragility, shown at checkout." },
  { icon: Wallet, title: "Pay on delivery", body: "Cash or M-Pesa when your items arrive. Nothing paid online." },
  { icon: ShieldCheck, title: "Handled with care", body: "Fragile and high-value pieces are packed and moved with extra care." },
];

export default async function DeliveryPage() {
  const settings = await getDeliverySettings();
  const paragraphs = settings.details.trim()
    ? settings.details.split(/\n+/).filter(Boolean)
    : DEFAULT_DETAILS;

  return (
    <main className="flex-1 bg-white">
      <section className="relative isolate overflow-hidden gradient-navy">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pt-40">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-gold-soft">Delivery & Returns</p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-light text-white sm:text-5xl text-balance">
            {settings.message}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {points.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-stone/40 p-6">
              <span className="flex size-11 items-center justify-center rounded-lg bg-navy text-gold">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <h3 className="mt-4 font-display text-lg text-navy">{title}</h3>
              <p className="mt-1 text-sm text-charcoal/75">{body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-2xl space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-charcoal/85 text-pretty">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about a delivery? We&apos;re happy to help.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-navy px-8 text-white hover:bg-navy-soft">
              <Link href="/collection">Browse the collection</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 border-navy/20 px-8 text-navy hover:bg-navy hover:text-white">
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>Call {siteConfig.phone}</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
