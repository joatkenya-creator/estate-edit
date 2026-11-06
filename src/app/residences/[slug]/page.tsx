import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { VideoEmbed } from "@/components/residences/video-embed";
import { ResidenceCard } from "@/components/residences/residence-card";
import { CompanyLogo, MediaPlaceholder, StatusBadge, VerifiedMark } from "@/components/residences/residence-ui";
import { getCompany, type Company } from "@/lib/companies";
import {
  areaHref,
  enquireHref,
  formatKes,
  formatListedDate,
  formatSpecs,
  getResidence,
  getResidences,
  sortResidences,
  type Residence,
} from "@/lib/residences";
import { SITE_URL, breadcrumbJsonLd, buildOpenGraph, clampDescription, clampTitle, residenceJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getResidences().map((r) => ({ slug: r.slug }));
}

function metaDescription(r: Residence, listedBy: Company): string {
  return clampDescription(
    r.description ??
      `${r.propertyType} for sale in ${r.area}, Nairobi: ${formatSpecs(r)}. ${formatKes(r.priceKes)}. Listed by ${listedBy.name}.`,
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = getResidence((await params).slug);
  if (!r) return {};
  const path = `/residences/${r.slug}`;
  const title = clampTitle(`${r.name}, ${r.area}`);
  const description = metaDescription(r, getCompany(r.listedBy)!);
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: buildOpenGraph({ title, description, path }),
  };
}

function Media({ residence: r }: { residence: Residence }) {
  if (r.videoUrl) {
    return <VideoEmbed url={r.videoUrl} title={`${r.name}: video tour`} className="mx-auto max-w-sm" />;
  }
  const images = r.images?.length ? r.images : r.imageUrl ? [r.imageUrl] : [];
  if (!images.length) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
        <MediaPlaceholder />
      </div>
    );
  }
  // Swipeable row of fixed 4:5 frames; scrolls inside itself, never the page.
  return (
    <div
      tabIndex={images.length > 1 ? 0 : undefined}
      aria-label={images.length > 1 ? `${r.name} photos, scroll for more` : undefined}
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
    >
      {images.map((src, i) => (
        <div key={src} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden rounded-xl bg-navy-deep">
          <Image
            src={src}
            alt={`${r.name}, photo ${i + 1} of ${images.length}`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function CompanyPanel({ label, company }: { label: string; company: Company }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="mt-3 flex min-w-0 items-center gap-3">
        <CompanyLogo company={company} />
        <p title={company.name} className="min-w-0 truncate font-display text-xl text-navy">
          {company.name}
        </p>
        <VerifiedMark company={company} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{company.shortDescription}</p>
      <Link
        href={`/developers/${company.slug}`}
        className="group mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-navy underline-offset-4 hover:text-gold hover:underline"
      >
        View company profile
        <span className="sr-only">: {company.name}</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

function MoreSection({ title, items }: { title: string; items: Residence[] }) {
  if (!items.length) return null;
  return (
    <section className="border-t border-border bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="font-display text-3xl font-light text-navy">{title}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResidenceCard key={r.slug} residence={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function ResidencePage({ params }: { params: Promise<{ slug: string }> }) {
  const r = getResidence((await params).slug);
  if (!r) notFound();

  // Validated at build time, so these always resolve.
  const listedBy = getCompany(r.listedBy)!;
  const developer = r.developer ? getCompany(r.developer)! : undefined;

  const others = sortResidences(getResidences().filter((o) => o.slug !== r.slug), "newest");
  const fromCompany = others.filter((o) => o.listedBy === r.listedBy).slice(0, 3);
  const inArea = others.filter((o) => o.area === r.area && !fromCompany.includes(o)).slice(0, 3);

  const facts = [
    ["Type", r.propertyType],
    ["Bedrooms", String(r.bedrooms)],
    ["Bathrooms", String(r.bathrooms)],
    ["Size", r.sizeLabel],
    ["Neighbourhood", r.area],
    ["Date listed", formatListedDate(r.dateListed)],
  ];

  return (
    <main className="flex-1">
      <JsonLd data={residenceJsonLd(r, listedBy)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Residences", path: "/residences" },
          { name: r.area, path: areaHref(r.area) },
          { name: r.name },
        ])}
      />

      <PageHero
        eyebrow={`${r.area} · ${r.propertyType}`}
        title={r.name}
        subtitle={formatSpecs(r)}
        crumbs={[
          { label: "Residences", href: "/residences" },
          { label: r.area, href: areaHref(r.area) },
          { label: r.name },
        ]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p className="font-display text-3xl font-semibold text-white">{formatKes(r.priceKes)}</p>
          <StatusBadge status={r.status} />
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Media residence={r} />

          <div className="min-w-0">
            <h2 className="font-display text-3xl font-light text-navy">Key facts</h2>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
              {facts.map(([label, value]) => (
                <div key={label} className="bg-white p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
                  <dd className="mt-1.5 font-medium text-navy">{value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-10 font-display text-3xl font-light text-navy">About this residence</h2>
            <p className="mt-4 leading-relaxed text-charcoal/80 text-pretty">
              {r.description ??
                `A ${r.propertyType.toLowerCase()} in ${r.area} with ${formatSpecs(r)}. Contact us for the full particulars and a filmed walkthrough.`}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group h-13 bg-navy px-8 text-base text-white hover:bg-navy-soft">
                <Link href={enquireHref(r)}>
                  Enquire about this residence
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {!developer || developer.slug === listedBy.slug ? (
                <CompanyPanel label={developer ? "Developed and listed by" : "Listed by"} company={listedBy} />
              ) : (
                <>
                  <CompanyPanel label="Developer" company={developer} />
                  <CompanyPanel label="Listed by" company={listedBy} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <MoreSection title={`More from ${listedBy.name}`} items={fromCompany} />
      <MoreSection title={`More in ${r.area}`} items={inArea} />
    </main>
  );
}
