/** Sits inside the account layout, so the sidebar stays; only the panel area waits. */
export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="animate-pulse space-y-4 motion-reduce:animate-none" aria-hidden>
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <div>
            <div className="h-7 w-40 rounded bg-stone-deep" />
            <div className="mt-2 h-4 w-56 rounded bg-stone" />
          </div>
          <div className="h-9 w-36 rounded-lg bg-stone-deep" />
        </div>
        <div className="h-12 rounded-xl border border-border bg-white" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="aspect-video bg-stone-deep" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 rounded bg-stone-deep" />
                <div className="h-4 w-1/3 rounded bg-stone" />
                <div className="h-9 w-full rounded-lg bg-stone" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">Loading your account</span>
    </div>
  );
}
