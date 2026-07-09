import "server-only";

/**
 * Resend email helpers (broadcasts + transactional). Set RESEND_API_KEY and
 * RESEND_FROM (a verified sender, e.g. "The Estate Edit <hello@estateedit.org>").
 * Works from the Cloudflare Worker (plain fetch).
 */

const RESEND_URL = "https://api.resend.com/emails";
const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";

function fromAddress(): string {
  return process.env.RESEND_FROM ?? "The Estate Edit <hello@estateedit.org>";
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY not set" };

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });
  if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text()}` };
  return { ok: true };
}

/**
 * Send the same email to many recipients (each gets their own copy). Uses
 * Resend's batch endpoint (max 100/call), chunked. Returns counts.
 */
export async function sendBatch(
  recipients: string[],
  subject: string,
  html: string,
): Promise<{ sent: number; failed: number }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: 0, failed: recipients.length };

  const from = fromAddress();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const payload = chunk.map((to) => ({ from, to, subject, html }));
    try {
      const res = await fetch(RESEND_BATCH_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) sent += chunk.length;
      else failed += chunk.length;
    } catch {
      failed += chunk.length;
    }
  }
  return { sent, failed };
}
