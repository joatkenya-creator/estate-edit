import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetGallery } from "@/components/collection/asset-gallery";
import { getAssetBySlug, getCatalogueAssets } from "@/lib/queries";
import { divisionLabel, type AssetDetail } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { assetJsonLd } from "@/lib/seo";

export const revalidate = 600;

/** Pre-render every catalogue item; unknown slugs render on demand. */
export async function generateStaticParams() {
  const assets = await getCatalogueAssets();
  return assets.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);
  if (!asset) return { title: "Asset not found" };
  const ogImage = asset.images[0]?.url ?? asset.imageUrl;
  return {
    title: asset.title,
    description:
      asset.description ??
      `${asset.category} available through The Estate Edit in Nairobi. Enquire in confidence.`,
    alternates: { canonical: `/collection/${slug}` },
    ...(ogImage ? { openGraph: { images: [{ url: ogImage }] } } : {}),
  };
}

function formatPrice(asset: AssetDetail) {
  if (asset.priceOnRequest || asset.price == null) return "Price on request";
  return `${asset.currency} ${asset.price.toLocaleString("en-US")}`;
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);
  if (!asset) notFound();

  // Build the specifications list from whichever fields are present.
  const specs: { label: string; value: string }[] = [
    { label: "Category", value: asset.category },
    { label: "Division", value: divisionLabel[asset.division] ?? asset.division },
    { label: "Status", value: asset.status[0].toUpperCase() + asset.status.slice(1) },
    asset.condition && { label: "Condition", value: asset.condition.replace(/_/g, " ") },
    asset.brand && { label: "Maker / Brand", value: asset.brand },
    asset.era && { label: "Era", value: asset.era },
    asset.dimensions && { label: "Dimensions", value: asset.dimensions },
    asset.provenance && { label: "Provenance", value: asset.provenance },
    asset.location && { label: "Location", value: asset.location },
  ].filter(Boolean) as { label: string; value: string }[];

  const gallery =
    asset.images.length > 0
      ? asset.images
      : asset.imageUrl
        ? [{ url: asset.imageUrl, alt: asset.title }]
        : [];

  return (
    <main className="flex-1 bg-white">
      <JsonLd data={assetJsonLd(asset)} />
      {/* Breadcrumb header */}
      <section className="relative isolate overflow-hidden gradient-navy">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pt-40">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-white/55">
            <Link href="/" className="transition-colors hover:text-gold">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/collection" className="transition-colors hover:text-gold">
              Collection
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">{asset.title}</span>
          </nav>
        </div>
      </section>

      {/* Detail */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image gallery */}
          <AssetGallery
            images={gallery}
            tone={asset.tone}
            status={asset.status}
            title={asset.title}
          />

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-[0.7rem] uppercase tracking-[0.25em] text-crimson">
              {asset.category}
            </p>
            <h1 className="mt-2 font-display text-3xl font-light text-navy sm:text-4xl text-balance">
              {asset.title}
            </h1>
            {asset.meta && (
              <p className="mt-3 text-sm text-muted-foreground">{asset.meta}</p>
            )}

            <p className="mt-6 font-display text-2xl text-navy">{formatPrice(asset)}</p>

            {asset.description && (
              <p className="mt-6 leading-relaxed text-charcoal/80 text-pretty">
                {asset.description}
              </p>
            )}

            {/* Specifications */}
            <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-border pt-8 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-sm capitalize text-charcoal">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {asset.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-stone px-3 py-1 text-xs text-charcoal/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-12 bg-navy px-8 text-white hover:bg-navy-soft"
              >
                <Link
                  href={{
                    pathname: "/contact",
                    query: {
                      asset: asset.slug,
                      title: asset.title,
                      category: asset.category,
                    },
                  }}
                >
                  Enquire about this piece
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group h-12 border-navy/20 px-8 text-navy hover:bg-navy hover:text-white"
              >
                <Link href="/collection">
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  Back to collection
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
