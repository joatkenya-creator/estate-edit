"use client";

import { useTransition } from "react";
import { Loader2, PackageCheck, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { toggleListingSold } from "@/app/actions/listings";

/** Seller control to mark an item sold, or relist it if the sale fell through. */
export function MarkSoldButton({
  listingId,
  isSold,
}: {
  listingId: string;
  isSold: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const { error } = await toggleListingSold(listingId);
          if (error) toast.error(error);
          else
            toast.success(
              isSold
                ? "Relisted — back on the marketplace shortly."
                : "Marked as sold and removed from the marketplace.",
            );
        })
      }
      className="flex items-center gap-1 text-xs text-charcoal/60 transition-colors hover:text-navy disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : isSold ? (
        <Undo2 className="size-3" />
      ) : (
        <PackageCheck className="size-3" />
      )}
      {isSold ? "Relist" : "Mark as sold"}
    </button>
  );
}
