import { PageHero } from "@/components/site/page-hero";

/** Shared shell for legal pages (Privacy, Terms) — consistent typographic layout. */
export function LegalShell({
  eyebrow = "Legal",
  title,
  subtitle,
  crumb,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumb: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} crumbs={[{ label: crumb }]} />
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Last updated: {updated}
          </p>
          <div className="mt-10 space-y-10">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-normal text-navy">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground text-pretty">
        {children}
      </div>
    </section>
  );
}
