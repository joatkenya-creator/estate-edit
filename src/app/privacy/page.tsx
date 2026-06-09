import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/site/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How The Estate Edit collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="Your privacy and discretion are central to how we work. This policy explains what we collect and how we use it."
      crumb="Privacy"
      updated="7 June 2026"
    >
      <LegalSection title="Introduction">
        <p>
          {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a luxury
          estate and transition management firm based in {siteConfig.location}. We are committed to
          protecting the personal information of our clients, prospects, and website visitors. This
          policy describes the information we collect and how we handle it.
        </p>
      </LegalSection>

      <LegalSection title="Information We Collect">
        <p>We collect information you provide directly to us, including when you submit an enquiry or request a consultation or asset review:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Contact details such as your name, email address, phone number, and location.</li>
          <li>Information about your enquiry, including your client type, service of interest, and any details you share about your estate, assets, or transition.</li>
          <li>Technical information automatically collected by our website, such as device and usage data.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Respond to your enquiry and provide the services you request.</li>
          <li>Prepare valuations, proposals, and asset reviews.</li>
          <li>Communicate with you about your engagement and our services.</li>
          <li>Improve our website and operations, and comply with legal obligations.</li>
        </ul>
        <p>We only contact you about your enquiry where you have consented to us doing so.</p>
      </LegalSection>

      <LegalSection title="Sharing & Disclosure">
        <p>
          We treat your affairs with the strictest confidence. We do not sell your personal
          information. We may share it only with trusted partners, such as logistics, storage, and
          vendor providers, strictly as needed to deliver your engagement, or where required by law.
        </p>
      </LegalSection>

      <LegalSection title="Data Retention">
        <p>
          We retain personal information for as long as necessary to provide our services, maintain
          business records, and meet legal and accounting requirements, after which it is securely
          deleted or anonymised.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use appropriate technical and organisational measures to protect your information
          against unauthorised access, loss, or misuse. No method of transmission or storage is
          completely secure, but we work to safeguard your data at every stage.
        </p>
      </LegalSection>

      <LegalSection title="Your Rights">
        <p>
          Subject to applicable law, including the Kenya Data Protection Act, you may request access
          to, correction of, or deletion of your personal information, and you may withdraw consent
          to marketing communications at any time. To exercise these rights, contact us using the
          details below.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Our website may use cookies and similar technologies to operate effectively and understand
          how the site is used. You can control cookies through your browser settings.
        </p>
      </LegalSection>

      <LegalSection title="Contact Us">
        <p>
          For any questions about this policy or your personal information, contact us at{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-navy underline underline-offset-4 hover:text-crimson">
            {siteConfig.email}
          </a>{" "}
          or {siteConfig.phone}.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
