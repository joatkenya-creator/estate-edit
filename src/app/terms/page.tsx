import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/site/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of The Estate Edit's website and services.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      subtitle="These terms govern your use of our website and the services we provide. Please read them carefully."
      crumb="Terms"
      updated="7 June 2026"
    >
      <LegalSection title="Acceptance of Terms">
        <p>
          By accessing this website or engaging {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;),
          you agree to these Terms of Service. If you do not agree, please do not use the website or
          our services.
        </p>
      </LegalSection>

      <LegalSection title="Our Services">
        <p>
          We provide luxury estate sales, commercial liquidation, concierge transition, and expat
          relocation services. Information on this website is provided for general guidance and does
          not constitute a binding offer. The specific scope, terms, and fees of any engagement are
          set out in a separate written agreement.
        </p>
      </LegalSection>

      <LegalSection title="Engagements & Fees">
        <p>
          Fees and any applicable project or setup charges are agreed in writing before
          work begins. Unless otherwise stated, quoted amounts exclude taxes, duties, and third-party
          costs such as transport, storage, or repairs.
        </p>
      </LegalSection>

      <LegalSection title="Valuations & Estimates">
        <p>
          Any valuation, estimate, or sale projection we provide is a professional opinion based on
          available information and prevailing market conditions. It is not a guarantee of a sale
          price or outcome. Final sale values depend on market demand at the time of sale.
        </p>
      </LegalSection>

      <LegalSection title="Client Responsibilities">
        <p>You agree to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Provide accurate information about the assets, estate, or property involved.</li>
          <li>Confirm you have the legal right or authority to sell or dispose of the assets.</li>
          <li>Cooperate with reasonable requests needed to deliver the engagement.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, we are not liable for indirect, incidental, or
          consequential losses. Nothing in these terms limits liability that cannot be excluded under
          applicable law.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual Property">
        <p>
          All content on this website, including text, branding, photography, and design, is owned
          by or licensed to {siteConfig.name} and may not be reproduced without our written
          permission.
        </p>
      </LegalSection>

      <LegalSection title="Governing Law">
        <p>
          These terms are governed by the laws of the Republic of Kenya, and any disputes are subject
          to the exclusive jurisdiction of the Kenyan courts.
        </p>
      </LegalSection>

      <LegalSection title="Changes to These Terms">
        <p>
          We may update these terms from time to time. The version published on this page is the
          current one, and continued use of the website constitutes acceptance of any changes.
        </p>
      </LegalSection>

      <LegalSection title="Contact Us">
        <p>
          Questions about these terms? Contact us at{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-navy underline underline-offset-4 hover:text-crimson">
            {siteConfig.email}
          </a>{" "}
          or{" "}
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="text-navy underline underline-offset-4 hover:text-crimson"
          >
            {siteConfig.phone}
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
