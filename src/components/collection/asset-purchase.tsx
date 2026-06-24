"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import type { CartItem } from "@/lib/site";

/**
 * Buy now / Add to cart for a purchasable (priced, in-stock) asset. Rendered
 * only for transactional items — luxury / price-on-request pieces keep the
 * Enquire path instead.
 */
export function AssetPurchase({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { add, setOpen } = useCart();
  const router = useRouter();

  const buyNow = () => {
    add(item, 1);
    setOpen(false); // don't pop the drawer — go straight to checkout
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={buyNow}
        size="lg"
        className="group h-12 bg-navy px-8 text-white hover:bg-navy-soft"
      >
        Buy now
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Button>
      <Button
        onClick={() => add(item, 1)}
        variant="outline"
        size="lg"
        className="h-12 border-navy/20 px-8 text-navy hover:bg-navy hover:text-white"
      >
        <ShoppingBag className="size-4" />
        Add to cart
      </Button>
    </div>
  );
}
