import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

/** "We deliver countrywide" trust badge (message comes from the CMS Delivery global). */
export function DeliveryBadge({
  message = "We deliver countrywide",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-navy",
        className,
      )}
    >
      <Truck className="size-3.5 text-gold" strokeWidth={1.8} />
      {message}
    </span>
  );
}
