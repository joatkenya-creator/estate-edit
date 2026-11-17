import { HeroSkeleton, ListingGridSkeleton } from "@/components/states/states";

export default function Loading() {
  return (
    <main className="min-h-screen bg-stone" aria-busy="true">
      <HeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-6 flex flex-wrap items-center gap-3" aria-hidden>
          <div className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white" />
          <div className="h-8 w-48 rounded-full bg-stone-deep" />
        </div>
        <div className="mb-4 h-4 w-24 rounded bg-stone-deep" aria-hidden />
        <ListingGridSkeleton />
      </div>
      <span className="sr-only" role="status">Loading listings</span>
    </main>
  );
}
