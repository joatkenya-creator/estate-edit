import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { regionContent, type FeaturedAsset } from "@/lib/site";
import { getFeaturedAssets } from "@/lib/queries";
import { getRegion } from "@/lib/region.server";
import { cn } from "@/lib/utils";

const toneGradient: Record<FeaturedAsset["tone"], string> = {
  navy: "linear-gradient(145deg,#001628 0%,#002349 55%,#0c3563 100%)",
  charcoal: "linear-gradient(145deg,#141414 0%,#1f1f1f 55%,#3a3a3a 100%)",
  crimson: "linear-gradient(145deg,#3d0c0f 0%,#7c181d 55%,#b3242b 100%)",
  gold: "linear-gradient(145deg,#5c4019 0%,#9c7536 55%,#b68a4e 100%)",
};

const statusStyles: Record<FeaturedAsset["status"], string> = {
  available: "bg-white/90 text-navy",
  reserved: "bg-gold text-navy",
  sold: "bg-crimson text-white",
};

export async function FeaturedAssets({
  limit,
  latest,
}: {
  /** Cap the number of items shown (e.g. 3 on the homepage). */
  limit?: number;
  /** Show the most recently added assets instead of the curated featured set. */
  latest?: boolean;
} = {}) {
  const assets = await getFeaturedAssets({ limit, latest });
  const region = await getRegion();

  return (
    <section id="assets" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-col items-end justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">The Collection</p>
            <h2 className="font-display text-4xl font-light text-navy sm:text-5xl text-balance">
              Featured assets, presented like fine-art lots
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            A curated selection from active estates and commercial liquidations across{" "}
            {regionContent[region].serves}&apos;s most distinguished addresses.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {assets.map((asset, i) => (
            <Reveal key={asset.slug} delay={i % 3}>
              <Link href={`/collection/${asset.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  {/* Scaling media layer: gradient base + optional photo */}
                  <div className="absolute inset-0 scale-100 transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110">
                    <div className="absolute inset-0" style={{ background: toneGradient[asset.tone] }} />
                    {asset.imageUrl && (
                      <Image
                        src={asset.imageUrl}
                        alt={asset.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* legibility sheen */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-white/5" />
                  <div className="pointer-events-none absolute -inset-x-10 -top-1/2 hidden h-full rotate-12 bg-white/10 blur-2xl transition-transform duration-1000 group-hover:translate-y-[180%] sm:block" />

                  {!asset.imageUrl && (
                    <span className="absolute inset-0 flex items-center justify-center font-display text-7xl text-white/10">
                      EE
                    </span>
                  )}

                  <span
                    className={cn(
                      "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-widest sm:right-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[0.65rem]",
                      statusStyles[asset.status],
                    )}
                  >
                    {asset.status}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold-soft sm:text-[0.7rem] sm:tracking-[0.25em]">
                      {asset.category}
                    </p>
                    <h3 className="mt-1 font-display text-base leading-snug text-white sm:text-xl">
                      {asset.title}
                    </h3>
                    {asset.meta && (
                      <p className="mt-0.5 line-clamp-1 text-[0.7rem] text-white/70 sm:mt-1 sm:text-xs">
                        {asset.meta}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 flex justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group h-12 border-navy/20 px-8 text-navy hover:bg-navy hover:text-white"
          >
            <Link href="/collection">
              Full Catalogue
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
