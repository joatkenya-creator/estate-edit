import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { BuyerEnquiry } from "@/components/developments/buyer-enquiry";
import {
  Attribution,
  DevelopmentCtas,
  MediaSlot,
  MobileBar,
  UnitTypeCard,
  developerOf,
} from "@/components/developments/development-ui";
import {
  STATUS_LABEL,
  developmentEnquireHref,
  developmentHref,
  formatSize,
  getDevelopment,
  getDevelopments,
  minSizeSqft,
} from "@/lib/developments";
import { SITE_URL, breadcrumbJsonLd, buildOpenGraph, clampDescription, clampTitle } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDevelopments().map((d) => ({ slug: d.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = getDevelopment((await params).slug);
  if (!d) return {};
  const path = developmentHref(d);
  const title = clampTitle(`${d.name} by ${developerOf(d).name}, ${d.locationName}`, 60);
  const description = clampDescription(d.shortDescription);
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: buildOpenGraph({ title, description, path }),
  };
}

/** Amenity tiles that get their own 3D animation (brief 4.1, #10–#13). */
const AMENITY_CLIPS = [
  "Community clubhouse",
  "Children's play area and family spaces",
  "Controlled access with security checkpoints",
  "Shopping complex with retail shops",
];

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display text-3xl font-light text-navy text-balance sm:text-4xl">{title}</h2>
    </>
  );
}

export default async function DevelopmentPage({ params }: Props) {
  const d = getDevelopment((await params).slug);
  if (!d) notFound();
  const developer = developerOf(d);
  const from = minSizeSqft(d);
  const apartments = d.unitTypes.filter((u) => u.category === "apartment").reduce((n, u) => n + u.unitCount, 0);

  const facts = [
    ...(d.totalUnits ? [`${d.totalUnits} homes`] : []),
    `${d.unitTypes.length} home types`,
    ...(from ? [`From ${formatSize(from)}`] : []),
    ...d.highlights,
  ];

  return (
    <main className="flex-1 pb-16 md:pb-0">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "New Developments", path: "/developments" },
          { name: d.name },
        ])}
      />

      {/* 1. Hero */}
      <PageHero
        eyebrow={`${d.locationName}${d.status ? ` · ${STATUS_LABEL[d.status]}` : ""}`}
        title={d.name}
        subtitle={d.tagline ?? undefined}
        crumbs={[{ label: "New Developments", href: "/developments" }, { label: d.name }]}
      >
        <p className="mt-3 text-sm text-white/70">A project by {developer.legalName} · Marketed by The Estate Edit</p>
        <div className="mt-8">
          <DevelopmentCtas dev={d} dark />
        </div>
        <MediaSlot label="Aerial view" className="mt-10 max-w-4xl" />
      </PageHero>

      {/* 2. Key facts, as text so crawlers and screen readers get them. */}
      <section aria-label="Key facts" className="border-b border-border bg-white">
        <ul className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-3 px-5 py-6 text-sm font-medium text-navy sm:px-8">
          {facts.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-lotus-pink" />
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Overview */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading eyebrow="Overview" title={d.tagline ?? d.name} />
          <p className="mt-5 text-lg leading-relaxed text-charcoal/80 text-pretty">{d.shortDescription}</p>
        </div>
      </section>

      {/* 4. Homes */}
      <section id="homes" className="bg-stone py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="Homes" title={`${d.unitTypes.length} home types`} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.unitTypes.map((u) => (
              <UnitTypeCard key={u.slug} dev={d} unit={u} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. The apartments */}
      {apartments > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="The apartments" title={`${apartments} of ${d.totalUnits} homes are apartments`} />
              <p className="mt-5 leading-relaxed text-charcoal/80">
                Mid-rise blocks with one high-speed lift per block, ample and secure parking, and cabro-paved
                driveways.
              </p>
            </div>
            <MediaSlot label="The blocks" />
          </div>
        </section>
      )}

      {/* 6. Amenities */}
      <section className="bg-stone py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="Amenities" title="Everything the community shares" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {d.amenities.map((a) => (
              <li key={a} className="flex items-start gap-3 rounded-lg bg-white p-4 text-sm text-charcoal">
                <Check className="mt-0.5 size-4 shrink-0 text-lotus-green" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {AMENITY_CLIPS.filter((a) => d.amenities.includes(a)).map((a) => (
              <MediaSlot key={a} label={a} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Shop names shown in the animations are illustrative.</p>
        </div>
      </section>

      {/* 7. Location */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="Location" title={d.locationName} />
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">Nearby, as listed in the {developer.name} brochure.</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {d.nearby.map((g) => (
              <div key={g.group}>
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{g.group}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-charcoal">
                  {g.places.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Buying process and payment plan */}
      <section className="bg-stone py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading eyebrow="Buying" title="Prices and payment plan" />
          <p className="mt-5 leading-relaxed text-charcoal/80">
            {d.paymentPlanSummary ??
              `Prices and the payment plan are shared on request. Ask for the price list and our sales team will send it, along with the current availability.`}
          </p>
          <Link
            href={developmentEnquireHref(d, undefined, "price_list")}
            className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-medium text-navy underline-offset-4 hover:text-gold hover:underline"
          >
            Request the price list
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 9. About the developer */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading eyebrow="The developer" title={developer.legalName} />
          <p className="mt-5 leading-relaxed text-charcoal/80">{developer.about}</p>
          <Link
            href={`/developers/${developer.slug}`}
            className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-medium text-navy underline-offset-4 hover:text-gold hover:underline"
          >
            About {developer.name}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="bg-stone py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <SectionHeading eyebrow="Enquire" title={`Ask about ${d.name}`} />
          <div className="mt-8 rounded-2xl border border-border bg-white p-6 sm:p-9">
            <BuyerEnquiry
              development={{ slug: d.slug, name: d.name, developerLegalName: developer.legalName }}
              unitTypes={d.unitTypes.map((u) => ({ slug: u.slug, name: u.name }))}
            />
          </div>
        </div>
      </section>

      <Attribution dev={d} />
      <MobileBar dev={d} />
    </main>
  );
}
