// Minimal types for the Workers-runtime `cloudflare:email` module (no bundled
// types). Used by the order-notification route via the Send Email binding.
declare module "cloudflare:email" {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string);
  }
}
