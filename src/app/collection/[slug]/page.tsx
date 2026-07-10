import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetGallery } from "@/components/collection/asset-gallery";
import { AssetPurchase } from "@/components/collection/asset-purchase";
import { ShareButtons } from "@/components/collection/share-buttons";
import { DeliveryBadge } from "@/components/commerce/delivery-badge";
import { getAllAssetSlugs, getAssetBySlug, getCatalogueAssets, getDeliverySettings } from "@/lib/queries";
import { divisionLabel, formatPriceRange, isPurchasable, siteConfig, type AssetDetail } from "@/lib/site";
import { getRegion } from "@/lib/region.server";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { assetFallbackDescription, assetJsonLd, buildOpenGraph, regionAlternates, SITE_URL } from "@/lib/seo";

// Region-specific pricing/availability — render per request.
export const dynamic = "force-dynamic";

/** Pre-render every catalogue item; unknown slugs render on demand. */
export async function generateStaticParams() {
  const slugs = await getAllAssetSlugs();
  return slugs.map((slug) => ({ slug }));
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
  const description = asset.description ?? assetFallbackDescription(asset);
  const region = await getRegion();
  return {
    title: asset.title,
    description,
    alternates: regionAlternates(`/collection/${slug}`, region),
    openGraph: buildOpenGraph({
      title: asset.title,
      description,
      path: `/collection/${slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
      region,
    }),
  };
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

  const buyable = isPurchasable(asset);
  const delivery = buyable ? await getDeliverySettings() : null;

  // Market-routed enquiry: Kenya buyers convert on WhatsApp; other markets go to
  // the contact form (captured as a lead in the CMS).
  const region = await getRegion();
  const enquireText = `Hi, I'm interested in "${asset.title}"${asset.category ? ` (${asset.category})` : ""} — ${SITE_URL}/collection/${asset.slug}`;
  const whatsappHref = `https://wa.me/${siteConfig.phone.replace(/\D/g, "")}?text=${encodeURIComponent(enquireText)}`;

  const productJsonLd = assetJsonLd(asset);

  // More internal links between asset pages: same category first, then fill
  // with the rest of the catalogue.
  const catalogue = await getCatalogueAssets();
  const related = [...catalogue]
    .filter((item) => item.slug !== asset.slug)
    .sort((a, b) => Number(b.categoryKey === asset.categoryKey) - Number(a.categoryKey === asset.categoryKey))
    .slice(0, 4);

  return (
    <main className="flex-1 bg-white">
      {productJsonLd && <JsonLd data={productJsonLd} />}
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

            {asset.priceOnRequest || asset.price == null ? (
              <p className="mt-6 font-display text-2xl text-navy">Price on request</p>
            ) : (
              <p className="mt-6 font-display text-2xl text-navy">
                {formatPriceRange(asset.price, asset.priceMax, asset.currency)}
              </p>
            )}

            {buyable && (
              <div className="mt-3">
                <DeliveryBadge message={delivery?.message} />
              </div>
            )}

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

            {/* Buy now / Add to cart for transactional (priced) items. */}
            {buyable && (
              <div className="mt-10">
                <AssetPurchase
                  item={{
                    slug: asset.slug,
                    title: asset.title,
                    price: asset.price as number,
                    currency: asset.currency,
                    imageUrl: gallery[0]?.url ?? asset.imageUrl,
                    deliveryTier: asset.deliveryTier,
                    fragile: asset.fragile,
                  }}
                />
              </div>
            )}

            <div className={cn("flex flex-col gap-4 sm:flex-row", buyable ? "mt-4" : "mt-10")}>
              {/* Enquire is the primary CTA for luxury pieces, secondary when buyable. */}
              <Button
                asChild
                size="lg"
                variant={buyable ? "outline" : "default"}
                className={cn(
                  "group h-12 px-8",
                  buyable
                    ? "border-navy/20 text-navy hover:bg-navy hover:text-white"
                    : "bg-navy text-white hover:bg-navy-soft",
                )}
              >
                {region === "kenya" ? (
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    {buyable ? "Ask on WhatsApp" : "Enquire on WhatsApp"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                ) : (
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
                    {buyable ? "Ask about this item" : "Enquire about this piece"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
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

            <ShareButtons url={`${SITE_URL}/collection/${asset.slug}`} title={asset.title} />
          </div>
        </div>
      </section>

      {/* More from the collection */}
      {related.length > 0 && (
        <section className="border-t border-border bg-stone/40 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="font-display text-2xl text-navy">More from the collection</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((item) => (
                <Link key={item.slug} href={`/collection/${item.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-charcoal/5">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-crimson">
                    {item.category}
                  </p>
                  <h3 className="text-sm text-navy group-hover:underline">{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
