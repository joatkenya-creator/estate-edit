import { notifyCustomer, type OrderEvent } from "@/lib/order-notifications";
import { timingSafeEqual } from "@/lib/timing-safe";

/**
 * Receives order status-change events from the CMS and sends the customer
 * an email and/or SMS. Protected by a shared secret (NOTIFY_SECRET) to
 * prevent unauthenticated callers from spamming customers.
 *
 * Called fire-and-forget from the CMS afterChange hook — failures here never
 * affect the order save in the CMS.
 */

export const dynamic = "force-dynamic";

const VALID_EVENTS = new Set<OrderEvent>([
  "confirmed",
  "dispatched",
  "delivered",
  "payment_received",
  "returned",
  "cancelled",
]);

type StatusPayload = {
  event: OrderEvent;
  orderNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  total: number;
  currency?: string;
  amountPaid?: number;
};

export async function POST(request: Request): Promise<Response> {
  try {
    // Fail closed: with no secret configured, reject rather than leave the
    // customer-notification endpoint open to abuse (SMS costs real money).
    const secret = process.env.NOTIFY_SECRET;
    const auth = request.headers.get("Authorization") ?? "";
    if (!secret || !timingSafeEqual(auth, `Bearer ${secret}`)) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as StatusPayload;
    const { event, orderNumber, fullName, phone, total } = body;

    if (!VALID_EVENTS.has(event) || !orderNumber || !fullName || !phone || total == null) {
      return Response.json({ ok: false, error: "bad payload" }, { status: 400 });
    }

    await notifyCustomer({
      event,
      orderNumber,
      fullName,
      phone,
      email: body.email,
      total,
      currency: body.currency ?? "KES",
      amountPaid: body.amountPaid,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("notify-status failed", err);
    return Response.json({ ok: false }, { status: 200 });
  }
}
