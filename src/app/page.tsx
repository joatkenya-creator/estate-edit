import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Pillars } from "@/components/sections/pillars";
import { Stats } from "@/components/sections/stats";
import { FeaturedAssets } from "@/components/sections/featured-assets";
import { MarketplaceTeaser } from "@/components/sections/marketplace-teaser";
import { Process } from "@/components/sections/process";
import { Clients } from "@/components/sections/clients";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";
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

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Pillars />
      <Stats />
      <FeaturedAssets latest limit={3} />
      <MarketplaceTeaser limit={4} />
      <Process />
      <Clients />
      <Testimonials />
      <Contact />
    </main>
  );
}
