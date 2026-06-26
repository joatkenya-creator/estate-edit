import "server-only";

const AT_API_URL = "https://api.africastalking.com/version1/messaging";

// Normalise Kenyan phone numbers to E.164 (+254XXXXXXXXX).
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+254${digits.slice(1)}`;
  if (digits.length === 9) return `+254${digits}`;
  return phone;
}

export async function sendSms(phone: string, message: string): Promise<void> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!apiKey || !username) return;

  const senderId = process.env.AT_SENDER_ID;
  const body = new URLSearchParams({ username, to: normalizePhone(phone), message });
  if (senderId) body.set("from", senderId);

  const res = await fetch(AT_API_URL, {
    method: "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    console.error("Africa's Talking SMS failed:", res.status, await res.text());
  }
}
