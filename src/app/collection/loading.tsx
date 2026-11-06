import { LotGridSkeleton } from "@/components/states/states";

/** Hero band and filters keep their real size; only the grid is placeholder cards. */
export default function Loading() {
  return (
    <main className="flex-1" aria-busy="true">
      <div className="gradient-navy">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 sm:pb-24 sm:pt-44" aria-hidden>
          <div className="h-3 w-32 rounded bg-white/15" />
          <div className="mt-6 h-10 w-3/4 max-w-2xl rounded bg-white/15 sm:h-14" />
          <div className="mt-5 h-4 w-full max-w-xl rounded bg-white/10" />
          <div className="mt-2 h-4 w-2/3 max-w-lg rounded bg-white/10" />
        </div>
      </div>
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-5 border-b border-border pb-8" aria-hidden>
            {[0, 1].map((row) => (
              <div key={row} className="flex flex-wrap gap-2">
                {[64, 90, 110, 80].map((w) => (
                  <div key={w} className="h-9 rounded-full bg-stone" style={{ width: w }} />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-6 h-5 w-28 rounded bg-stone" aria-hidden />
          <div className="mt-8">
            <LotGridSkeleton />
          </div>
        </div>
      </section>
      <span className="sr-only" role="status">Loading the Collection</span>
    </main>
  );
}
