const MAIL_FROM = process.env.MAIL_FROM ?? "The Estate Edit <info@estateedit.org>";

export type WelcomeUser = {
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
  phone?: string | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function welcomeEmailHtml(user: WelcomeUser): string {
  const name = escapeHtml(user.name);
  const email = escapeHtml(user.email);
  const role = escapeHtml(user.role.charAt(0).toUpperCase() + user.role.slice(1));
  const createdAt = formatDate(user.createdAt);
  const phoneRow = user.phone
    ? `<tr>
            <td class="label">Phone</td>
            <td class="value">${escapeHtml(user.phone)}</td>
          </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Estate Edit</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f6f4f1;
      padding: 40px 16px;
      color: #2d2d2d;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,35,73,0.10);
    }
    .header {
      background: linear-gradient(135deg, #001a36 0%, #002349 100%);
      background-color: #002349;
      padding: 52px 40px 40px;
      text-align: center;
    }
    .header h1 {
      font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
      color: #ccab79;
      font-size: 32px;
      font-weight: normal;
      letter-spacing: 3px;
    }
    .header .subtitle {
      color: #8fa4bd;
      font-size: 11px;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .header .rule {
      width: 60px;
      height: 2px;
      background: #b68a4e;
      margin: 22px auto 0;
      font-size: 0;
      line-height: 0;
    }
    .body { padding: 44px 40px; }
    .body h2 {
      font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
      color: #002349;
      font-size: 26px;
      font-weight: normal;
      margin-bottom: 18px;
    }
    .body p {
      color: #4a4a4a;
      line-height: 1.8;
      font-size: 15px;
      margin-bottom: 16px;
    }
    .detail-card {
      background: #f6f4f1;
      border: 1px solid #e4ded6;
      border-radius: 4px;
      padding: 24px 28px;
      margin: 28px 0;
    }
    .detail-card h3 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #b68a4e;
      margin-bottom: 16px;
    }
    .detail-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .detail-table td { padding: 11px 0; border-bottom: 1px solid #e8e2da; }
    .detail-table tr:last-child td { border-bottom: none; }
    .detail-table .label { color: #8a8378; text-align: left; }
    .detail-table .value { color: #002349; font-weight: 600; text-align: right; }
    .role-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      background: #ffffff;
      color: #b68a4e;
      border: 1px solid #ddc9a8;
    }
    .cta {
      display: inline-block;
      background: #002349;
      color: #ccab79 !important;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 2px;
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .divider { width: 100%; height: 1px; background: #ece7e0; margin: 28px 0; }
    .footer {
      background: #f6f4f1;
      border-top: 1px solid #e4ded6;
      padding: 28px 40px;
      text-align: center;
    }
    .footer p { color: #9a9389; font-size: 12px; line-height: 1.7; }
    .footer .brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: #002349;
      font-size: 16px;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>The Estate Edit</h1>
      <p class="subtitle">Estate Sales &amp; Liquidation &middot; Nairobi</p>
      <div class="rule">&nbsp;</div>
    </div>

    <div class="body">
      <h2>Welcome, ${name}.</h2>
      <p>
        Your account has been created successfully. We are glad to have you with
        <strong>The Estate Edit</strong>. You now have access to our curated
        listings, private sale previews, and valuation enquiries.
      </p>

      <div class="detail-card">
        <h3>Your Account Details</h3>
        <table class="detail-table">
          <tr>
            <td class="label">Full Name</td>
            <td class="value">${name}</td>
          </tr>
          <tr>
            <td class="label">Email Address</td>
            <td class="value">${email}</td>
          </tr>
          ${phoneRow}
          <tr>
            <td class="label">Account Type</td>
            <td class="value"><span class="role-badge">${role}</span></td>
          </tr>
          <tr>
            <td class="label">Member Since</td>
            <td class="value">${createdAt}</td>
          </tr>
        </table>
      </div>

      <p style="text-align: center; margin: 32px 0;">
        <a class="cta" href="https://estateedit.org">Browse Current Sales</a>
      </p>

      <div class="divider"></div>

      <p>
        If you are preparing an estate, downsizing, or relocating, reply to this
        email and we will arrange a discreet, no-obligation valuation.
      </p>
      <p style="margin-top: 32px; color: #002349;">
        Warm regards,<br>
        <strong>The Estate Edit Team</strong>
      </p>
    </div>

    <div class="footer">
      <p class="brand">THE ESTATE EDIT</p>
      <p>
        Nairobi, Kenya &middot; estateedit.org<br>
        If you did not create this account, please ignore this email or contact
        us immediately.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/** Fire-and-forget from the caller's perspective: errors are logged, never thrown. */
export async function sendWelcomeEmail(user: WelcomeUser): Promise<void> {
  try {
    // Dynamic import: keeps welcomeEmailHtml (pure, no I/O) free of the
    // server-only guard's transitive dependency, so it stays plain-Node
    // testable (see the check script) without touching Resend at all.
    const { resendClient } = await import("./resend");
    const { error } = await resendClient().emails.send({
      from: MAIL_FROM,
      to: user.email,
      replyTo: MAIL_FROM,
      subject: "Welcome to The Estate Edit",
      html: welcomeEmailHtml(user),
    });
    if (error) console.error("Welcome email failed:", error);
  } catch (err) {
    console.error("Welcome email failed:", err);
  }
}
