import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { MediaSlot, developerOf } from "@/components/developments/development-ui";
import {
  STATUS_LABEL,
  developmentHref,
  formatPrice,
  formatSize,
  getDevelopments,
  minSizeSqft,
} from "@/lib/developments";
import { SITE_URL, breadcrumbJsonLd, buildOpenGraph } from "@/lib/seo";

const PATH = "/developments";
const TITLE = "New Developments in Nairobi";
const DESCRIPTION =
  "New homes from Nairobi developers, marketed by The Estate Edit: unit types, floor plans, amenities and private viewings.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, path: PATH }),
};

export default function DevelopmentsPage() {
  const developments = getDevelopments();

  return (
    <main className="flex-1">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "New Developments" }])} />
      <PageHero
        eyebrow="New Developments"
        title="New homes, presented in full"
        subtitle="Every home type with its floor plan, room sizes and 3D animation, so you can choose before you visit."
        crumbs={[{ label: "New Developments" }]}
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-2">
          {developments.map((d) => {
            const from = minSizeSqft(d);
            return (
              <article key={d.slug} className="hover-lift flex flex-col overflow-hidden rounded-xl border border-border bg-white">
                <MediaSlot label={d.name} className="rounded-none" />
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <p className="eyebrow">
                    {d.locationName}
                    {d.status ? ` · ${STATUS_LABEL[d.status]}` : ""}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-navy">{d.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">A project by {developerOf(d).legalName}</p>
                  <p className="mt-4 text-charcoal/80 text-pretty">{d.shortDescription}</p>
                  <p className="mt-4 text-sm text-charcoal">
                    {d.unitTypes.map((u) => u.name).join(" · ")}
                    {from ? ` · from ${formatSize(from)}` : ""}
                  </p>
                  <p className="mt-2 font-medium text-navy">{formatPrice(d.priceFromKes)}</p>
                  <Link
                    href={developmentHref(d)}
                    className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-5 text-sm font-medium text-navy underline-offset-4 hover:text-gold hover:underline"
                  >
                    View {d.name}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
