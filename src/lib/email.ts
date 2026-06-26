import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM = "The Estate Edit <orders@estateedit.org>";

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, text }),
  });

  if (!res.ok) {
    console.error("Resend email failed:", res.status, await res.text());
  }
}
