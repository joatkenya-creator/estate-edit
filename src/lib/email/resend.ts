import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

/** Lazily-constructed Resend client (avoids throwing at import time when the key is unset in dev). */
export function resendClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY ?? "");
  return client;
}
