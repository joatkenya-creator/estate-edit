import type { Metadata } from "next";
import { getDeliverySettings } from "@/lib/queries";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order — pay on delivery, countrywide.",
  robots: { index: false }, // a transactional page, keep out of search
};

export default async function CheckoutPage() {
  const settings = await getDeliverySettings();

  return (
    <main className="flex-1 bg-white">
      <section className="relative isolate overflow-hidden gradient-navy">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pt-40">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-gold-soft">Checkout</p>
          <h1 className="mt-2 font-display text-3xl font-light text-white sm:text-4xl">
            Complete your order
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <CheckoutForm settings={settings} />
      </section>
    </main>
  );
}
