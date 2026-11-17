import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Globe, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { ResidenceBrowser } from "@/components/residences/residence-browser";
import { VideoEmbed } from "@/components/residences/video-embed";
import { CompanyLogo, RoleTags, VerifiedMark } from "@/components/residences/residence-ui";
import { ROLE_LABEL, getCompany } from "@/lib/companies";
import { residencesForCompany } from "@/lib/residences";
import { developmentHref, getDevelopments } from "@/lib/developments";
import { DEVELOPMENTS_LIVE } from "@/lib/site";
import { SITE_URL, breadcrumbJsonLd, buildOpenGraph, clampTitle, companyJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const company = getCompany((await params).slug);
  if (!company) return {};
  const path = `/developers/${company.slug}`;
  const roles = company.roles.map((r) => ROLE_LABEL[r]).join(" & ");
  const title = clampTitle(`${company.name}, ${roles} in Nairobi`);
  // Tab and filter views canonicalise to the profile itself.
  return {
    title,
    description: company.shortDescription,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: buildOpenGraph({ title, description: company.shortDescription, path }),
  };
}

const contactLink =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 text-sm text-white transition-colors hover:bg-white/10";

export default async function CompanyPage({ params, searchParams }: Props) {
  const company = getCompany((await params).slug);
  if (!company) notFound();

  const { listed, developed, active } = residencesForCompany(company.slug);
  const hasTabs = listed.length > 0 && developed.length > 0;
  const tab = hasTabs && (await searchParams).tab === "developed" ? "developed" : listed.length ? "listed" : "developed";
  const items = tab === "developed" ? developed : listed;
  const path = `/developers/${company.slug}`;

  // Published developments only, and only once /developments is live.
  const projects = DEVELOPMENTS_LIVE ? getDevelopments().filter((d) => d.developer === company.slug) : [];

  const stats = [
    projects.length
      ? { label: "Projects", value: String(projects.length) }
      : { label: "Active listings", value: String(active) },
    { label: "Areas covered", value: String(company.areas.length) },
    ...(company.yearFounded ? [{ label: "Founded", value: String(company.yearFounded) }] : []),
  ];

  return (
    <main className="flex-1">
      <JsonLd data={companyJsonLd(company)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Developers", path: "/developers" },
          { name: company.name },
        ])}
      />

      <PageHero
        eyebrow={company.roles.map((r) => ROLE_LABEL[r]).join(" · ")}
        title={company.name}
        subtitle={company.shortDescription}
        crumbs={[{ label: "Developers", href: "/developers" }, { label: company.name }]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <CompanyLogo company={company} size="lg" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <RoleTags company={company} dark />
              <VerifiedMark company={company} />
            </div>
            <div className="flex flex-wrap gap-2">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className={contactLink}>
                  <Globe className="size-4" aria-hidden="true" />
                  Website<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {company.phone && (
                <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className={contactLink}>
                  <Phone className="size-4" aria-hidden="true" />
                  {company.phone}
                </a>
              )}
              {company.tiktok && (
                <a href={company.tiktok} target="_blank" rel="noopener noreferrer" className={contactLink}>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  TikTok<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {company.instagram && (
                <a href={company.instagram} target="_blank" rel="noopener noreferrer" className={contactLink}>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Instagram<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className={contactLink}>
                  <Mail className="size-4" aria-hidden="true" />
                  {company.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </PageHero>

      <section className="bg-white pt-16 sm:pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-light text-navy">About {company.name}</h2>
            <p className="mt-4 leading-relaxed text-charcoal/80 text-pretty">{company.about}</p>
            <p className="mt-4 text-sm text-muted-foreground">Works in {company.areas.join(", ")}.</p>
            {company.address && <p className="mt-2 text-sm text-muted-foreground">Head office: {company.address}</p>}
            {projects.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-3xl font-light text-navy">Projects</h2>
                <ul className="mt-4 space-y-2">
                  {projects.map((d) => (
                    <li key={d.slug}>
                      <Link href={developmentHref(d)} className="font-medium text-navy underline-offset-4 hover:text-gold hover:underline">
                        {d.name}
                      </Link>
                      <span className="text-sm text-muted-foreground"> · {d.locationName}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <dl className={cn("grid h-fit gap-px overflow-hidden rounded-xl border border-border bg-border", stats.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
            {stats.map((s) => (
              <div key={s.label} className="bg-white p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</dt>
                <dd className="mt-1.5 font-display text-3xl text-navy">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {hasTabs && (
          <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-8">
          <nav aria-label="Listings" className="flex gap-6 border-b border-border">
            {(["listed", "developed"] as const).map((t) => (
              <Link
                key={t}
                href={t === "listed" ? path : `${path}?tab=developed`}
                scroll={false}
                aria-current={t === tab ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex min-h-11 items-center border-b-2 text-sm font-medium transition-colors",
                  t === tab ? "border-gold text-navy" : "border-transparent text-muted-foreground hover:text-navy",
                )}
              >
                {t === "listed" ? `Listed (${listed.length})` : `Developed (${developed.length})`}
              </Link>
            ))}
          </nav>
          </div>
        )}
      </section>

      {company.videos?.length ? (
        <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-light text-navy">Property tours</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.videos.map((url, i) => (
              <VideoEmbed key={url} url={url} title={`${company.name}: tour ${i + 1}`} />
            ))}
          </div>
          {(company.tiktok || company.instagram) && (
            <p className="mt-6 text-sm text-muted-foreground">
              See more tours on{" "}
              {company.tiktok && (
                <a href={company.tiktok} target="_blank" rel="noopener noreferrer" className="font-medium text-navy underline">
                  TikTok
                </a>
              )}
              {company.tiktok && company.instagram && " and "}
              {company.instagram && (
                <a href={company.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-navy underline">
                  Instagram
                </a>
              )}
              .
            </p>
          )}
        </div>
      ) : null}

      {listed.length + developed.length > 0 ? (
        <ResidenceBrowser
          key={tab}
          items={items}
          scoped
          heading={tab === "developed" ? `Developed by ${company.name}` : `Listed by ${company.name}`}
        />
      ) : (
        <div className="pb-20 sm:pb-24" />
      )}
    </main>
  );
}
