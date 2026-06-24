"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";

/** Header cart trigger with a live item-count badge. */
export function CartButton({ inverted }: { inverted: boolean }) {
  const { count, ready, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count > 0 ? `Open cart, ${count} item(s)` : "Open cart"}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-md border transition-colors",
        inverted
          ? "border-white/30 text-white hover:bg-white/10"
          : "border-border text-navy hover:bg-stone",
      )}
    >
      <ShoppingBag className="size-5" />
      {ready && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.65rem] font-semibold text-navy">
          {count}
        </span>
      )}
    </button>
  );
}
