import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Contact } from "@/components/sections/contact";
import { buildOpenGraph, regionAlternates } from "@/lib/seo";
import { getRegion } from "@/lib/region.server";
import { getCompany } from "@/lib/companies";
import { getDevelopment } from "@/lib/developments";
import { DEVELOPMENTS_LIVE } from "@/lib/site";
import { BuyerEnquiry } from "@/components/developments/buyer-enquiry";
import { developerOf } from "@/components/developments/development-ui";

const title = "Contact & Consultations";
const description =
  "Book a private consultation or request an asset review with The Estate Edit, luxury estate and transition management in Kenya.";

export async function generateMetadata(): Promise<Metadata> {
  const region = await getRegion();
  return {
    title,
    description,
    alternates: regionAlternates("/contact", region),
    openGraph: buildOpenGraph({ title, description, path: "/contact", region }),
  };
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    asset?: string;
    title?: string;
    category?: string;
    /** Residence enquiries: the listing company's slug. */
    listedBy?: string;
    /** Buyer enquiries (brief 7.6): development slug, unit type slug, enquiry type. */
    development?: string;
    unit?: string;
    enquiry?: string;
  }>;
}) {
  const { asset, title, category, listedBy, development, unit, enquiry } = await searchParams;
  const dev = DEVELOPMENTS_LIVE && development ? getDevelopment(development) : undefined;
  if (dev) {
    const developer = developerOf(dev);
    return (
      <main className="flex-1">
        <PageHero
          eyebrow={dev.name}
          title={`Enquire about ${dev.name}`}
          subtitle={`Our sales team replies within one business day. A project by ${developer.legalName}, marketed by The Estate Edit.`}
          crumbs={[{ label: dev.name, href: `/developments/${dev.slug}` }, { label: "Enquire" }]}
        />
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 sm:p-9">
            <BuyerEnquiry
              development={{ slug: dev.slug, name: dev.name, developerLegalName: developer.legalName }}
              unitTypes={dev.unitTypes.map((u) => ({ slug: u.slug, name: u.name }))}
              unit={unit}
              enquiry={enquiry}
            />
          </div>
        </section>
      </main>
    );
  }
  // Only treat it as an asset enquiry when we have both a slug and a title.
  // An unknown company slug is dropped rather than shown.
  const company = listedBy ? getCompany(listedBy) : undefined;
  const inquiryAsset =
    asset && title
      ? { slug: asset, title, category, listedBy: company && { slug: company.slug, name: company.name } }
      : undefined;

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Begin the conversation"
        title="Speak with our concierge team"
        subtitle="Every engagement begins with a private, no-obligation consultation. Share a few details and we will respond within one business day."
        crumbs={[{ label: "Contact" }]}
      />
      <Contact asset={inquiryAsset} />
    </main>
  );
}
