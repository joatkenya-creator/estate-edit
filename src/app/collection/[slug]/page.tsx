import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssetBySlug, getCatalogueAssets } from "@/lib/queries";
import { divisionLabel, type AssetDetail } from "@/lib/site";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { assetJsonLd } from "@/lib/seo";

export const revalidate = 600;

const toneGradient: Record<AssetDetail["tone"], string> = {
  navy: "linear-gradient(145deg,#001628 0%,#002349 55%,#0c3563 100%)",
  charcoal: "linear-gradient(145deg,#141414 0%,#1f1f1f 55%,#3a3a3a 100%)",
  crimson: "linear-gradient(145deg,#3d0c0f 0%,#7c181d 55%,#b3242b 100%)",
  gold: "linear-gradient(145deg,#5c4019 0%,#9c7536 55%,#b68a4e 100%)",
};

const statusStyles: Record<AssetDetail["status"], string> = {
  available: "bg-white/90 text-navy",
  reserved: "bg-gold text-navy",
  sold: "bg-crimson text-white",
};

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
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <div className="absolute inset-0" style={{ background: toneGradient[asset.tone] }} />
              {gallery[0] ? (
                <Image
                  src={gallery[0].url}
                  alt={gallery[0].alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-display text-8xl text-white/10">
                  EE
                </span>
              )}
              <span
                className={cn(
                  "absolute right-4 top-4 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest",
                  statusStyles[asset.status],
                )}
              >
                {asset.status}
              </span>
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.slice(1, 5).map((img) => (
                  <div key={img.url} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

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
