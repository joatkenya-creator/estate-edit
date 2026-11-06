import { HeroSkeleton, ListingGridSkeleton } from "@/components/states/states";

export default function Loading() {
  return (
    <main className="min-h-screen bg-stone" aria-busy="true">
      <HeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6">
        <div className="mb-5 h-4 w-56 rounded bg-stone-deep" aria-hidden />
        <ListingGridSkeleton />
      </div>
      <span className="sr-only" role="status">Loading listings</span>
    </main>
  );
}
