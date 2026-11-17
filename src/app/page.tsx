import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Pillars } from "@/components/sections/pillars";
import { DevelopmentBand } from "@/components/sections/development-band";
import { Stats } from "@/components/sections/stats";
import { FeaturedAssets } from "@/components/sections/featured-assets";
import { MarketplaceTeaser } from "@/components/sections/marketplace-teaser";
import { Process } from "@/components/sections/process";
import { Clients } from "@/components/sections/clients";
import { Contact } from "@/components/sections/contact";
import { ListingCardSkeleton, LotCardSkeleton } from "@/components/states/states";
import { getRegion } from "@/lib/region.server";
import { regionAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const region = await getRegion();
  return { alternates: regionAlternates("/", region) };
}

// Statically generated, regenerated every 10 minutes so content edits in
// Supabase surface without a redeploy.
// Region-specific (Kenya vs Virginia store), so it must render per request.
export const dynamic = "force-dynamic";

/** Same section boxes as the real ones, so the page doesn't jump when they stream in. */
function GridFallback({ kind }: { kind: "lots" | "listings" }) {
  const lots = kind === "lots";
  return (
    <section aria-busy="true" className={`${lots ? "bg-white" : "bg-stone"} py-24 sm:py-32`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="h-3 w-32 rounded bg-stone-deep" aria-hidden />
        <div className="mt-4 h-10 w-2/3 max-w-lg rounded bg-stone-deep" aria-hidden />
        <div
          className={
            lots
              ? "mt-14 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3"
              : "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          {Array.from({ length: lots ? 3 : 4 }, (_, i) =>
            lots ? <LotCardSkeleton key={i} /> : <ListingCardSkeleton key={i} />,
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <DevelopmentBand />
      <Pillars />
      <Stats />
      <Suspense fallback={<GridFallback kind="lots" />}>
        <FeaturedAssets latest limit={3} />
      </Suspense>
      <Suspense fallback={<GridFallback kind="listings" />}>
        <MarketplaceTeaser limit={4} />
      </Suspense>
      <Process />
      <Clients />
      <Contact />
    </main>
  );
}
