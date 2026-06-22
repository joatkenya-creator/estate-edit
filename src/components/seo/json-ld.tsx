/**
 * Renders a schema.org JSON-LD block. Server component — safe to embed the
 * stringified object directly. Used for Organization (layout) and Product
 * (asset pages) structured data.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated server-side from trusted content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
