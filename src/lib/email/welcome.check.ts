// Run: node --experimental-strip-types src/lib/email/welcome.check.ts
import assert from "node:assert/strict";
import { welcomeEmailHtml } from "./welcome.ts";

const withoutPhone = welcomeEmailHtml({
  name: "Jane Doe",
  email: "jane@example.com",
  role: "seller",
  createdAt: "2026-08-19T00:00:00Z",
});
assert.ok(!withoutPhone.includes(">Phone<"), "Phone row should be omitted when phone is absent");

const withScriptName = welcomeEmailHtml({
  name: "<script>x</script>",
  email: "jane@example.com",
  role: "seller",
  createdAt: "2026-08-19T00:00:00Z",
  phone: "+254712345678",
});
assert.ok(!withScriptName.includes("<script>x</script>"), "raw <script> tag must not appear unescaped");
assert.ok(withScriptName.includes("&lt;script&gt;"), "name should be HTML-escaped");

console.log("welcome.check.ts: OK");
