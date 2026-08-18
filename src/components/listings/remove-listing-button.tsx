"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeListing } from "@/app/actions/listings";

/**
 * Seller-facing remove control. Drafts are deleted outright; anything that has
 * been live is withdrawn (see removeListing) — either way it leaves the
 * marketplace.
 */
export function RemoveListingButton({
  listingId,
  isDraft,
}: {
  listingId: string;
  isDraft: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          isDraft
            ? "Delete this draft? This can't be undone."
            : "Remove this listing from the marketplace? Buyers will no longer see it.",
        );
        if (!ok) return;
        startTransition(async () => {
          const { error } = await removeListing(listingId);
          if (error) toast.error(error);
          else
            toast.success(
              isDraft ? "Draft deleted." : "Listing removed from the marketplace.",
            );
        });
      }}
      className="flex items-center gap-1 text-xs text-red-600 transition-colors hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Trash2 className="size-3" />
      )}
      {isDraft ? "Delete" : "Remove"}
    </button>
  );
}
