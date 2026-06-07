import { getStats } from "@/lib/queries";
import { StatsGrid } from "@/components/sections/stats-grid";

export async function Stats() {
  const metrics = await getStats();

  return (
    <section id="why" className="relative overflow-hidden gradient-navy py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 gradient-hairline" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="eyebrow mb-4">Why The Estate Edit</p>
          <h2 className="font-display text-4xl font-light text-white sm:text-5xl text-balance">
            A measured track record of <span className="italic text-gold">discretion and value</span>
          </h2>
        </div>

        <StatsGrid metrics={metrics} />
      </div>
    </section>
  );
}
