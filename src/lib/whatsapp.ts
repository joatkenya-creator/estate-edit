import "server-only";

/**
 * WhatsApp Cloud API (Meta) sender for broadcasts. Marketing messages to people
 * who haven't messaged you in 24h MUST use a pre-approved template — so this
 * sends a template by name with body parameters.
 *
 * Requires a WhatsApp Business Account: set WHATSAPP_TOKEN, WHATSAPP_PHONE_ID,
 * and WHATSAPP_TEMPLATE (an approved marketing template name). No-ops if unset.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

/** Normalise a Kenyan number to E.164 digits (2547XXXXXXXX). */
export function toE164Ke(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return `254${d.slice(1)}`;
  if ((d.startsWith("7") || d.startsWith("1")) && d.length === 9) return `254${d}`;
  return d.length >= 10 ? d : null;
}

export async function sendWhatsAppTemplate(
  to: string,
  bodyParams: string[] = [],
  templateName?: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const template = templateName ?? process.env.WHATSAPP_TEMPLATE;
  if (!token || !phoneId || !template) return { ok: false, error: "WhatsApp not configured" };

  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: "en" },
        ...(bodyParams.length
          ? {
              components: [
                { type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: t })) },
              ],
            }
          : {}),
      },
    }),
  });
  if (!res.ok) return { ok: false, error: `WhatsApp ${res.status}: ${await res.text()}` };
  return { ok: true };
}

export function whatsappConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TEMPLATE,
  );
}
