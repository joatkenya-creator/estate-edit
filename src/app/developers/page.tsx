import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { CompanyLogo, RoleTags, VerifiedMark } from "@/components/residences/residence-ui";
import { ROLE_LABEL, getCompanies, type Company, type CompanyRole } from "@/lib/companies";
import { residencesForCompany } from "@/lib/residences";
import { OG_IMAGE, SITE_URL, breadcrumbJsonLd, buildOpenGraph } from "@/lib/seo";

const PATH = "/developers";
const TITLE = "Property Developers & Agencies in Nairobi";
const DESCRIPTION =
  "The developers and estate agencies listing luxury residences on The Estate Edit, with the neighbourhoods they work in and their current listings.";

// Kenya-only, like /residences. ?role= views canonicalise to the full directory.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

const ROLE_FILTERS: { value: CompanyRole | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "developer", label: "Developers" },
  { value: "agency", label: "Agencies" },
];

function CompanyCard({ company }: { company: Company }) {
  const { active } = residencesForCompany(company.slug);
  return (
    // The name's link is stretched over the card; the verified mark sits above it.
    <article className="relative flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-colors hover:border-navy/40">
      <div className="flex min-w-0 items-center gap-3">
        <CompanyLogo company={company} />
        <h2 className="min-w-0 font-display text-xl text-navy">
          <Link
            href={`${PATH}/${company.slug}`}
            title={company.name}
            className="block truncate outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-navy"
          >
            {company.name}
          </Link>
        </h2>
        <VerifiedMark company={company} className="relative z-10" />
      </div>
      <div className="mt-4">
        <RoleTags company={company} />
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{company.shortDescription}</p>
      <p className="mt-auto pt-4 text-sm text-charcoal">
        <span className="sr-only">Areas: </span>
        {company.areas.join(" · ")}
      </p>
      <p className="mt-3 border-t border-border pt-3 text-sm font-medium text-navy">
        {active} active {active === 1 ? "listing" : "listings"}
      </p>
    </article>
  );
}

export default async function DevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const roleParam = (await searchParams).role;
  const role = (Object.keys(ROLE_LABEL) as CompanyRole[]).find((r) => r === roleParam) ?? null;
  const companies = getCompanies()
    .filter((c) => !role || c.roles.includes(role))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="flex-1">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Developers" }])} />
      <PageHero
        eyebrow="Developers & agencies"
        title="The companies behind Nairobi's finest residences"
        subtitle="Every residence on The Estate Edit shows who built it and who is selling it. Browse the developers and agencies we work with."
        crumbs={[{ label: "Developers" }]}
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav aria-label="Filter by role" className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((f) => {
              const active = f.value === role;
              return (
                <Link
                  key={f.label}
                  href={f.value ? `${PATH}?role=${f.value}` : PATH}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-navy bg-navy text-white"
                      : "border-border bg-white text-charcoal/70 hover:border-navy/40 hover:text-navy",
                  )}
                >
                  {f.label}
                </Link>
              );
            })}
          </nav>
          <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
            {companies.length} {companies.length === 1 ? "company" : "companies"}, A to Z
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
