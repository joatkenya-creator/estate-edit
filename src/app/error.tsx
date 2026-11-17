"use client";

import { useEffect } from "react";
import { StatePanel } from "@/components/states/states";
import { ContactFallback, useOnline } from "@/components/states/form-states";

/**
 * Error boundary for every page. It renders inside the root layout, so the
 * header and footer stay put and the visitor can navigate away as normal.
 * (global-error.tsx only takes over if the layout itself fails.)
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const online = useOnline();
  useEffect(() => console.error(error), [error]);

  return (
    <main className="flex-1 bg-stone px-5 pb-24 pt-36 sm:pt-44">
      <StatePanel
        eyebrow={online ? "Something went wrong" : "You're offline"}
        title={
          online
            ? "This page didn't load because of a problem on our side."
            : "This page needs a connection to load."
        }
        primary={
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-navy px-6 text-sm font-medium text-white transition-colors hover:bg-navy-soft"
          >
            Try again
          </button>
        }
        secondary={{ label: "Back to homepage", href: "/" }}
      >
        <p>
          {online
            ? "It isn't anything you did. Try again in a moment. "
            : "Pages you have already opened still work. Try again when you're back online. "}
          <ContactFallback prefix="If it keeps happening, reach us on" />
        </p>
        {error.digest && <p className="mt-4 text-xs text-charcoal/40">Reference: {error.digest}</p>}
      </StatePanel>
    </main>
  );
}
