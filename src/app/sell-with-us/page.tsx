import type { Metadata } from "next";
import { TrendingUp, Camera, ShieldCheck, Users } from "lucide-react";
import { ConsignForm } from "@/components/marketing/consign-form";
import { getRegion } from "@/lib/region.server";
import { buildOpenGraph } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Sell With Us — Consign Your Estate & Luxury Assets";
const description =
  "Consign luxury, estate, and commercial assets with The Estate Edit. Professional valuation, editorial marketing, and a private buyer network. Request a free valuation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sell-with-us" },
  openGraph: buildOpenGraph({ title, description, path: "/sell-with-us" }),
};

const points = [
  { icon: TrendingUp, title: "Maximise value", body: "Market valuation and private buyer outreach to realise the best price." },
  { icon: Camera, title: "Editorial marketing", body: "Professional photography and listings across our channels." },
  { icon: ShieldCheck, title: "Discreet & careful", body: "Confidential handling of high-value pieces, start to finish." },
  { icon: Users, title: "Qualified buyers", body: "A private network of collectors, expatriates, and businesses." },
];

export default async function SellWithUsPage() {
  const isVa = (await getRegion()) === "virginia";
  const place = isVa ? "Virginia" : "Kenya";

  return (
    <main className="flex-1 bg-white">
      <section className="relative isolate overflow-hidden gradient-navy">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pt-40">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-gold-soft">Sell With Us</p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-light text-white sm:text-5xl text-balance">
            Turn your estate & luxury assets into their best price
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
            Downsizing, relocating, settling an estate, or liquidating a business in {place}? We
            value, market, and sell your assets to qualified buyers — discreetly and end to end.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="font-display text-2xl text-navy">Why consign with The Estate Edit</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {points.map(({ icon: Icon, title: t, body }) => (
                <div key={t} className="rounded-2xl border border-border bg-stone/40 p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-navy text-gold">
                    <Icon className="size-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-3 font-display text-lg text-navy">{t}</h3>
                  <p className="mt-1 text-sm text-charcoal/75">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_30px_80px_-50px_rgba(0,35,73,0.4)] sm:p-8">
            <h2 className="font-display text-2xl text-navy">Request a free valuation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what you have — we&apos;ll respond within one business day.
            </p>
            <div className="mt-6">
              <ConsignForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
