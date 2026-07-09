import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBatch } from "@/lib/resend";
import { sendWhatsAppTemplate, toE164Ke, whatsappConfigured } from "@/lib/whatsapp";
import { formatPriceRange } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Item = {
  slug: string;
  title: string | null;
  price: number | null;
  price_max: number | null;
  currency: string | null;
  primary_image_url: string | null;
};

function priceLabel(it: Item): string {
  if (it.price == null) return "Enquire for price";
  return formatPriceRange(Number(it.price), it.price_max, it.currency || "KES");
}

function buildEmail(items: Item[], market: "kenya" | "virginia"): string {
  const place = market === "virginia" ? "Virginia" : "Kenya";
  const cards = items
    .map(
      (it) => `
    <tr><td style="padding:8px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;">
        <tr>
          ${it.primary_image_url ? `<td width="120" style="padding:0;"><img src="${it.primary_image_url}" width="120" height="120" style="display:block;object-fit:cover;width:120px;height:120px;" alt=""></td>` : ""}
          <td style="padding:14px 16px;font-family:Georgia,serif;">
            <div style="font-size:16px;color:#002349;font-weight:600;">${it.title ?? ""}</div>
            <div style="font-size:14px;color:#7c181d;margin-top:4px;">${priceLabel(it)}</div>
            <a href="${SITE_URL}/collection/${it.slug}?utm_source=email&utm_medium=broadcast&utm_campaign=new_arrivals" style="display:inline-block;margin-top:10px;font-size:13px;color:#002349;text-decoration:underline;">View item →</a>
          </td>
        </tr>
      </table>
    </td></tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f5f5f4;padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:8px 0 20px;font-family:Georgia,serif;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9c7536;">The Estate Edit · ${place}</div>
          <div style="font-size:26px;color:#002349;margin-top:6px;">New arrivals just listed</div>
        </td></tr>
        ${cards}
        <tr><td style="padding:24px 0;font-family:Georgia,serif;text-align:center;">
          <a href="${SITE_URL}/collection?utm_source=email&utm_medium=broadcast&utm_campaign=new_arrivals" style="display:inline-block;background:#002349;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">Browse the full collection</a>
        </td></tr>
        <tr><td style="padding:16px 0;font-family:Arial,sans-serif;font-size:11px;color:#a8a29e;text-align:center;">
          You're receiving this because you asked for new-arrival alerts from The Estate Edit.
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

/**
 * Broadcast new arrivals to the subscriber list for a market. Secured by
 * BROADCAST_TOKEN (?token= or x-broadcast-token). Body: { market, slugs?, subject? }.
 * Emails via Resend; WhatsApp template to Kenyan subscribers with a phone.
 */
export async function POST(request: NextRequest) {
  const provided =
    new URL(request.url).searchParams.get("token") ?? request.headers.get("x-broadcast-token");
  if (!process.env.BROADCAST_TOKEN || provided !== process.env.BROADCAST_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    market?: "kenya" | "virginia";
    slugs?: string[];
    subject?: string;
  };
  const market = body.market === "virginia" ? "virginia" : "kenya";

  const admin = createAdminClient();

  let itemsQ = admin
    .from("assets")
    .select("slug, title, price, price_max, currency, primary_image_url")
    .eq("_status", "published")
    .eq("market", market);
  itemsQ =
    body.slugs && body.slugs.length
      ? itemsQ.in("slug", body.slugs)
      : itemsQ.order("created_at", { ascending: false }).limit(6);
  const { data: items } = await itemsQ;
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No published items to feature" }, { status: 400 });
  }

  const { data: subs } = await admin
    .from("subscribers")
    .select("email, phone")
    .eq("market", market);
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, message: "No subscribers for this market", emailsSent: 0 });
  }

  const subject = body.subject ?? `New arrivals at The Estate Edit`;
  const html = buildEmail(items as Item[], market);
  const emails = [...new Set(subs.map((s) => s.email).filter(Boolean))] as string[];
  const { sent, failed } = await sendBatch(emails, subject, html);

  // WhatsApp (Kenya) — template message to subscribers who left a phone number.
  let whatsappSent = 0;
  if (market === "kenya" && whatsappConfigured()) {
    for (const s of subs) {
      if (!s.phone) continue;
      const to = toE164Ke(s.phone);
      if (!to) continue;
      const r = await sendWhatsAppTemplate(to, [String(items.length)]);
      if (r.ok) whatsappSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    market,
    items: items.length,
    emailsSent: sent,
    emailsFailed: failed,
    whatsappSent,
  });
}
