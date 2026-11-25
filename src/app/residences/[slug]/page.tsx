import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { AssetGallery } from "@/components/collection/asset-gallery";
import { VideoEmbed } from "@/components/residences/video-embed";
import { TourVideo } from "@/components/residences/tour-video";
import { ResidenceCard } from "@/components/residences/residence-card";
import { CompanyLogo, MediaPlaceholder, StatusBadge, VerifiedMark } from "@/components/residences/residence-ui";
import { getCompany, type Company } from "@/lib/companies";
import { DEVELOPMENTS_WHATSAPP, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  areaHref,
  coverImage,
  enquireHref,
  formatPrice,
  formatListedDate,
  formatSpecs,
  getResidence,
  getResidences,
  listingTag,
  sortResidences,
  type Residence,
} from "@/lib/residences";
import { SITE_URL, breadcrumbJsonLd, buildOpenGraph, clampDescription, clampTitle, residenceJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getResidences().map((r) => ({ slug: r.slug }));
}

function metaDescription(r: Residence, listedBy?: Company): string {
  return clampDescription(
    r.seo?.description ??
      r.description ??
      `${r.propertyType} ${r.status === "For rent" ? "to rent" : "for sale"} in ${r.area}, Nairobi: ${formatSpecs(r)}. ${formatPrice(r)}.${listedBy ? ` Listed by ${listedBy.name}.` : ""}`,
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = getResidence((await params).slug);
  if (!r) return {};
  const path = `/residences/${r.slug}`;
  const title = r.seo?.title ?? clampTitle(`${r.name}, ${r.area}`);
  const description = metaDescription(r, r.listedBy ? getCompany(r.listedBy) : undefined);
  const cover = r.tour ? { url: r.tour.ogImage, alt: r.name } : r.images?.[0];
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: buildOpenGraph({
      title,
      description,
      path,
      ...(cover ? { images: [{ url: `${SITE_URL}${cover.url}`, alt: cover.alt }] } : {}),
    }),
  };
}

function Media({ residence: r }: { residence: Residence }) {
  if (r.tour) return <TourVideo tour={r.tour} title={`${r.name}: video tour`} />;
  if (r.videoUrl) {
    return <VideoEmbed url={r.videoUrl} title={`${r.name}: video tour`} className="mx-auto max-w-sm" />;
  }
  if (r.images?.length) {
    return <AssetGallery images={r.images} tone="navy" title={r.name} aspect="aspect-[4/3]" />;
  }
  const still = coverImage(r);
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy-deep">
      {still ? (
        <Image src={still} alt={r.name} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      ) : (
        <MediaPlaceholder />
      )}
    </div>
  );
}

/** Call the office (the viewing line) or send the contact form pre-filled with this listing. */
function Ctas({ residence: r, dark = false }: { residence: Residence; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button
        asChild
        size="lg"
        className={cn("group h-auto min-h-13 w-full whitespace-normal px-7 py-3 text-base sm:w-auto", dark ? "bg-gold text-navy hover:bg-gold-soft" : "bg-navy text-white hover:bg-navy-soft")}
      >
        <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}>
          <Phone className="size-4" aria-hidden="true" />
          Book a private viewing: {siteConfig.phone}
        </a>
      </Button>
      {r.whatsapp && (
        <Button
          asChild
          size="lg"
          variant="outline"
          className={cn(
            "group h-auto min-h-13 w-full whitespace-normal px-7 py-3 text-base sm:w-auto",
            dark ? "border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white" : "border-navy/30 text-navy hover:bg-navy/5",
          )}
        >
          <a
            href={`https://wa.me/${DEVELOPMENTS_WHATSAPP}?text=${encodeURIComponent(`Hi, I'm interested in ${r.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp us
          </a>
        </Button>
      )}
      <Button
        asChild
        size="lg"
        variant="outline"
        className={cn(
          "group h-auto min-h-13 w-full whitespace-normal px-7 py-3 text-base sm:w-auto",
          dark ? "border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white" : "border-navy/30 text-navy hover:bg-navy/5",
        )}
      >
        <Link href={enquireHref(r)}>
          Ask about this home
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </Button>
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
  const listedBy = r.listedBy ? getCompany(r.listedBy)! : undefined;
  const developer = r.developer ? getCompany(r.developer)! : undefined;
  const rental = r.status === "For rent";

  const others = sortResidences(getResidences().filter((o) => o.slug !== r.slug), "newest");
  const fromCompany = listedBy ? others.filter((o) => o.listedBy === r.listedBy).slice(0, 3) : [];
  const inArea = others.filter((o) => o.area === r.area && !fromCompany.includes(o)).slice(0, 3);

  const facts = [
    ["Type", r.furnishing ? `${r.propertyType}, ${r.furnishing.toLowerCase()}` : r.furnished ? `${r.propertyType}, fully furnished` : r.propertyType],
    ["Bedrooms", String(r.bedrooms)],
    ...(r.bathrooms !== undefined ? [["Bathrooms", String(r.bathrooms)]] : []),
    ...(r.sizeLabel ? [["Size", r.sizeLabel]] : []),
    ["Neighbourhood", r.area],
    ...(r.alsoToLet ? [["Offered", "For sale or to let"]] : []),
    ...(r.lease
      ? [
          ["Lease", r.lease.term],
          ["Rent includes", r.lease.includes.join(", ")],
          ...(r.lease.powerBackup ? [["Power backup", r.lease.powerBackup]] : []),
        ]
      : []),
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
        eyebrow={rental ? [listingTag(r), r.area].join(" · ") : `${r.area} · ${r.propertyType}`}
        title={r.headline ?? r.name}
        subtitle={r.intro ?? formatSpecs(r)}
        crumbs={[
          { label: "Residences", href: "/residences" },
          { label: r.area, href: areaHref(r.area) },
          { label: r.name },
        ]}
      >
        {r.valueLine ? (
          <div className="mt-6 max-w-2xl space-y-1.5 text-sm leading-relaxed text-white/75 sm:text-base">
            <p>
              <strong className="font-semibold text-white">{r.valueLine.lead}</strong> {r.valueLine.text}
            </p>
            {r.valueLine.note && <p>{r.valueLine.note}</p>}
          </div>
        ) : (
          r.headline && <p className="mt-6 max-w-2xl text-sm text-white/60">{r.name}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p className="font-display text-3xl font-semibold text-white">
            {r.pricePrefix || r.priceNote ? (
              <>
                {r.pricePrefix && <><span className="text-[0.7em] font-normal italic text-gold-soft">{r.pricePrefix}</span> </>}
                {formatPrice(r)}
                {r.priceNote && <span className="text-[0.7em] font-normal italic text-gold-soft">, {r.priceNote}</span>}
              </>
            ) : (
              formatPrice(r)
            )}
          </p>
          <StatusBadge status={r.status} label={listingTag(r)} />
        </div>
        {r.includedHighlights && (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">Included in the rent</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {r.includedHighlights.map((h) => (
                <li
                  key={h}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold-soft/70 bg-navy/40 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-widest text-white/90"
                >
                  <Check className="size-3.5 text-gold-soft" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8">
          <Ctas residence={r} dark />
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="min-w-0">
            <Media residence={r} />
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-3xl font-light text-navy">Key facts</h2>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
              {facts.map(([label, value]) => (
                <div key={label} className="bg-white p-4 [&:last-child:nth-child(odd)]:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
                  <dd className="mt-1.5 font-medium text-navy">{value}</dd>
                </div>
              ))}
            </dl>

            {(r.description || !r.sections) && (
              <>
                <h2 className="mt-10 font-display text-3xl font-light text-navy">About this residence</h2>
                <p className="mt-4 leading-relaxed text-charcoal/80 text-pretty">
                  {r.description ??
                    `A ${r.propertyType.toLowerCase()} in ${r.area} with ${formatSpecs(r)}. Contact us for the full particulars and a filmed walkthrough.`}
                </p>
              </>
            )}

            {r.goodFor && (
              <>
                <h2 className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Good fit for</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {r.goodFor.map((g) => (
                    <li key={g} className="rounded-full border border-navy/20 bg-stone px-3.5 py-1.5 text-sm text-navy">
                      {g}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {developer && !listedBy && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <CompanyPanel label="Developer" company={developer} />
              </div>
            )}
            {listedBy && (
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
            )}
          </div>
        </div>
      </section>

      {r.sections?.map((s, i) => (
        <section key={s.title} className={cn("py-16 sm:py-20", i % 2 === 0 ? "bg-stone" : "bg-white")}>
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="font-display text-3xl font-light text-navy text-balance sm:text-4xl">{s.title}</h2>
            {s.body && <p className="mt-5 text-lg leading-relaxed text-charcoal/80 text-pretty">{s.body}</p>}
            {s.items && (
              <ul className="mt-6 space-y-3">
                {s.items.map((item) => (
                  <li key={item.text} className="flex items-start gap-3 leading-relaxed text-charcoal/85">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    <span>
                      {item.label && <span className="font-medium text-navy">{item.label}: </span>}
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      {/* Closing call to action. */}
      <section className="gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-light text-white text-balance sm:text-4xl">Book a private viewing</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70 text-pretty">
            Call {siteConfig.phone} to arrange a time, or send us a question about this home.
          </p>
          <div className="mt-8 flex justify-center">
            <Ctas residence={r} dark />
          </div>
        </div>
      </section>

      {listedBy && <MoreSection title={`More from ${listedBy.name}`} items={fromCompany} />}
      <MoreSection title={`More in ${r.area}`} items={inArea} />
    </main>
  );
}
