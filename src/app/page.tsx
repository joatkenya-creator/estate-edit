import { Hero } from "@/components/sections/hero";
import { Pillars } from "@/components/sections/pillars";
import { Stats } from "@/components/sections/stats";
import { FeaturedAssets } from "@/components/sections/featured-assets";
import { Process } from "@/components/sections/process";
import { Clients } from "@/components/sections/clients";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

// Statically generated, regenerated every 10 minutes so content edits in
// Supabase surface without a redeploy.
export const revalidate = 600;

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Pillars />
      <Stats />
      <FeaturedAssets />
      <Process />
      <Clients />
      <Testimonials />
      <Contact />
    </main>
  );
}
