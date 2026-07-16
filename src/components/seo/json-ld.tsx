/**
 * Renders a schema.org JSON-LD block. Server component — safe to embed the
 * stringified object directly. Used for Organization (layout) and Product
 * (asset pages) structured data.
 */
export function JsonLd({ data }: { data: object }) {
  // `<` is escaped so a CMS-entered title/description containing a literal
  // "</script>" can't terminate the tag early — the HTML tokenizer scans for
  // that sequence before any JS/JSON parsing happens, regardless of it being
  // "inside a string" from JSON's perspective.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Structured data is generated server-side from trusted content.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
