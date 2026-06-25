import { getCloudflareContext } from "@opennextjs/cloudflare";
import { formatMoney, type CartItem } from "@/lib/site";

/**
 * Sends a new-order alert to staff using the Cloudflare Send Email binding
 * (ORDER_EMAIL), which delivers to the verified Email Routing destination.
 * Called fire-and-forget by the checkout after the order is saved, so any
 * failure here never affects the customer's order.
 */

export const dynamic = "force-dynamic";

type Payload = {
  orderNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  county: string;
  town?: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
};

const SENDER = "orders@estateedit.org";
const RECIPIENT = "joatkenya120@gmail.com";

function buildBody(o: Payload): string {
  const lines = o.items
    .map((it) => `  • ${it.quantity} × ${it.title} — ${formatMoney(it.price * it.quantity, o.currency)}`)
    .join("\n");
  return [
    `New order ${o.orderNumber}`,
    ``,
    `Customer: ${o.fullName}`,
    `Phone:    ${o.phone}`,
    o.email ? `Email:    ${o.email}` : null,
    `Deliver:  ${[o.address, o.town, o.county].filter(Boolean).join(", ")}`,
    ``,
    `Items:`,
    lines,
    ``,
    `Subtotal: ${formatMoney(o.subtotal, o.currency)}`,
    `Delivery: ${formatMoney(o.deliveryFee, o.currency)}`,
    `Total:    ${formatMoney(o.total, o.currency)}`,
    ``,
    `Payment is on delivery. Triage this order in the CMS → Sales → Orders.`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export async function POST(request: Request): Promise<Response> {
  try {
    const o = (await request.json()) as Payload;
    if (!o?.orderNumber || !o?.fullName || !Array.isArray(o?.items)) {
      return Response.json({ ok: false, error: "bad payload" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const binding = (env as Record<string, unknown>).ORDER_EMAIL as
      | { send: (msg: unknown) => Promise<void> }
      | undefined;

    // No binding (e.g. local dev) — skip silently; the order is already saved.
    if (!binding) return Response.json({ ok: true, skipped: "no email binding" });

    // cloudflare:email is a Workers-runtime module; keep it out of the bundle.
    const { EmailMessage } = await import(/* webpackIgnore: true */ "cloudflare:email");

    const subject = `New order ${o.orderNumber} — ${formatMoney(o.total, o.currency)} (${o.county})`;
    const raw = [
      `From: The Estate Edit Orders <${SENDER}>`,
      `To: ${RECIPIENT}`,
      `Reply-To: ${o.email || RECIPIENT}`,
      `Subject: ${subject}`,
      `Message-ID: <${crypto.randomUUID()}@estateedit.org>`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      buildBody(o),
    ].join("\r\n");

    await binding.send(new EmailMessage(SENDER, RECIPIENT, raw));
    return Response.json({ ok: true });
  } catch (err) {
    console.error("notify-order failed", err);
    // Never surface to the customer — the order itself succeeded.
    return Response.json({ ok: false }, { status: 200 });
  }
}
