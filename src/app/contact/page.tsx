import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Contact } from "@/components/sections/contact";
import { buildOpenGraph, regionAlternates } from "@/lib/seo";
import { getRegion } from "@/lib/region.server";
import { getCompany } from "@/lib/companies";

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
  }>;
}) {
  const { asset, title, category, listedBy } = await searchParams;
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
