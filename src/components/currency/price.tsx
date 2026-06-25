"use client";

import { useCurrency } from "./currency-context";

/** Renders a KES amount in the visitor's display currency. */
export function Price({ kes, className }: { kes: number; className?: string }) {
  const { format } = useCurrency();
  return <span className={className}>{format(kes)}</span>;
}

/**
 * Small disclosure shown only when prices are being converted: clarifies that
 * the displayed currency is a reference and orders settle in KES.
 */
export function CurrencyNote({ className }: { className?: string }) {
  const { converting, currency } = useCurrency();
  if (!converting) return null;
  return (
    <p className={className}>
      Shown in {currency} for reference · orders are processed in KES.
    </p>
  );
}
