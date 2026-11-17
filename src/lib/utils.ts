import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * WhatsApp click-to-chat link, pointing straight at api.whatsapp.com.
 * wa.me 302-redirects there, which Ahrefs flags as links to redirects; the
 * destination is identical (same recipient, same prefilled text).
 * No phone = WhatsApp's "pick a chat" share sheet.
 */
export function whatsappUrl(text?: string, phone?: string | null): string {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone.replace(/\D/g, ""));
  if (text) params.set("text", text);
  return `https://api.whatsapp.com/send?${params}`;
}

/** Phones on Data Saver or 2G: smaller images, no motion. */
export function prefersLightweight(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || c?.effectiveType === "2g" || c?.effectiveType === "slow-2g");
}
