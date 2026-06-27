import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string; currency?: string }>;
}) {
  const { order, total, currency } = await searchParams;
  const totalNum = total ? Number(total) : null;
  const isUs = (currency || "KES") === "USD";

  return (
    <main className="flex-1 bg-white">
      <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <CheckCircle2 className="mx-auto size-14 text-gold" strokeWidth={1.5} />
        <h1 className="mt-6 font-display text-3xl font-light text-navy sm:text-4xl">
          Thank you, your order is in
        </h1>

        {order && (
          <p className="mt-3 text-sm text-muted-foreground">
            Order number{" "}
            <span className="font-mono font-semibold text-navy">{order}</span>
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-stone/40 p-6 text-left">
          {totalNum != null && (
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm text-muted-foreground">Order total</span>
              <span className="font-display text-xl text-navy">
                {formatMoney(totalNum, currency || "KES")}
              </span>
            </div>
          )}

          <div className="space-y-4 pt-4 text-sm text-charcoal/85">
            <p className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-navy" strokeWidth={1.6} />
              <span>
                <span className="font-medium text-navy">We&apos;ll be in touch shortly.</span> Our
                team will call or WhatsApp you to confirm the order and arrange delivery.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Truck className="mt-0.5 size-5 shrink-0 text-navy" strokeWidth={1.6} />
              <span>
                <span className="font-medium text-navy">Pay after delivery.</span> No payment is
                needed now.{" "}
                {isUs
                  ? "Settle by cash on delivery once your items arrive."
                  : "Settle by cash or M-Pesa once your items arrive. We deliver countrywide."}
              </span>
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Questions? Call us on{" "}
          <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="font-medium text-navy hover:text-gold">
            {siteConfig.phone}
          </a>
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-12 bg-navy px-8 text-white hover:bg-navy-soft">
            <Link href="/collection">Continue shopping</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 border-navy/20 px-8 text-navy hover:bg-navy hover:text-white">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
