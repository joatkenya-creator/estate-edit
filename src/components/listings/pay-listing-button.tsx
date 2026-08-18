"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type PaystackHandler = { openIframe: () => void };
type PaystackPop = {
  setup: (opts: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    channels: string[];
    metadata?: Record<string, unknown>;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }) => PaystackHandler;
};
declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

/** Load Paystack's inline popup script once. */
function loadPaystack(): Promise<PaystackPop> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () =>
      window.PaystackPop ? resolve(window.PaystackPop) : reject(new Error("Paystack unavailable"));
    s.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(s);
  });
}

type Props = {
  listingId: string;
  amount: number;
  currency: string;
  email: string;
  /** Paystack public key, resolved on the server at request time. */
  paystackKey: string;
  className?: string;
  size?: "sm" | "lg" | "default";
};

/**
 * Pays a listing fee via the Paystack popup and verifies it server-side.
 * Used both right after posting and to rescue drafts whose payment never
 * completed (otherwise they stay `draft` forever and never reach the
 * marketplace).
 */
export function PayListingButton({
  listingId,
  amount,
  currency,
  email,
  paystackKey,
  className,
  size = "lg",
}: Props) {
  const [paying, setPaying] = useState(false);
  // Kenya can pay by card, bank or M-Pesa; other markets by card or bank.
  const channels = currency === "KES" ? ["card", "bank", "mobile_money"] : ["card", "bank"];

  async function verifyPayment(reference: string) {
    try {
      const res = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, listingId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        toast.success("Payment confirmed — your listing is under review and goes live shortly.");
        window.location.href = "/account/listings";
        return;
      }
      toast.error(data.error ?? "We couldn't confirm the payment. If you were charged, contact us.");
    } catch {
      toast.error("Could not confirm the payment. Please try again.");
    }
    setPaying(false);
  }

  async function handlePay() {
    if (!paystackKey) {
      toast.error("Payments are unavailable right now. Please contact support.");
      return;
    }
    setPaying(true);
    try {
      const Paystack = await loadPaystack();
      const reference = `EE-${listingId.slice(0, 8)}-${Date.now().toString(36)}`;
      const handler = Paystack.setup({
        key: paystackKey,
        email,
        amount: Math.round(amount * 100),
        currency,
        ref: reference,
        channels,
        metadata: { listingId },
        callback: (response) => {
          void verifyPayment(response.reference);
        },
        onClose: () => setPaying(false),
      });
      handler.openIframe();
    } catch {
      toast.error("Could not open the payment window. Please try again.");
      setPaying(false);
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={paying}
      size={size}
      className={className ?? "w-full bg-navy text-white hover:bg-navy-soft"}
    >
      {paying ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Processing…
        </>
      ) : (
        `Pay ${currency} ${amount.toLocaleString()}`
      )}
    </Button>
  );
}
