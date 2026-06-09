import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  title: "Contact & Consultations",
  description:
    "Book a private consultation or request an asset review with The Estate Edit, luxury estate and transition management in Nairobi.",
};

export default function ContactPage() {
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Begin the conversation"
        title="Speak with our concierge team"
        subtitle="Every engagement begins with a private, no-obligation consultation. Share a few details and we will respond within one business day."
        crumbs={[{ label: "Contact" }]}
      />
      <Contact />
    </main>
  );
}
