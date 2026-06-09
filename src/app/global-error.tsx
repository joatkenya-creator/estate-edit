"use client";

/**
 * Global error boundary: replaces the root layout when a top-level error is
 * thrown. It must be a Client Component and render its own <html>/<body>.
 * Styles are inlined because the root layout (and its fonts/CSS variables) are
 * not applied here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#001628",
          color: "#ffffff",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              fontSize: "0.7rem",
              color: "#ccab79",
              marginBottom: "1.25rem",
            }}
          >
            The Estate Edit
          </p>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 300,
              lineHeight: 1.15,
              margin: "0 0 1rem",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 2rem" }}>
            An unexpected error occurred. Please try again, or return to the homepage. Our team is
            always reachable if you need assistance.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => (reset ? reset() : window.location.reload())}
              style={{
                cursor: "pointer",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.8rem 1.6rem",
                fontSize: "0.95rem",
                background: "#b68a4e",
                color: "#002349",
                fontWeight: 500,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: "0.5rem",
                padding: "0.8rem 1.6rem",
                fontSize: "0.95rem",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              Back to homepage
            </a>
          </div>
          {error?.digest && (
            <p style={{ marginTop: "2rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
