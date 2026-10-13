"use client";

/**
 * Shown when the root layout itself fails. It replaces the whole document, so it renders its own
 * <html>/<body> and uses inline styles (no app CSS or providers are guaranteed to be available).
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f8fa",
          color: "#1b262c",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 440 }}>
          <div
            aria-hidden="true"
            style={{
              margin: "0 auto 20px",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0f4c75",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            KS
          </div>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>Kursat Shop şu an açılamadı</h1>
          <p style={{ fontSize: 14, color: "#56636c", margin: "0 0 24px", lineHeight: 1.6 }}>
            Beklenmeyen bir hata oluştu. Sayfayı yeniden denemek çoğu zaman yeterli olur.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#0f4c75",
              color: "#ffffff",
              border: 0,
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
          {error.digest && <p style={{ marginTop: 24, fontSize: 12, color: "#64717a" }}>Hata kodu: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
