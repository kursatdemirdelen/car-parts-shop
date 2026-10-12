import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Inlines a local /public SVG as a data URL so the OG renderer can draw it. */
async function svgDataUrl(src: string | undefined): Promise<string | null> {
  if (!src?.endsWith(".svg")) return null;
  try {
    const svg = await readFile(join(process.cwd(), "public", src), "utf8");
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  } catch {
    return null;
  }
}

/** Shared Open Graph card: wordmark, eyebrow, title, a detail line and an optional product illustration. */
export async function ogCard({ eyebrow, title, detail, image }: { eyebrow: string; title: string; detail: string; image?: string }) {
  const img = await svgDataUrl(image);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", color: "#1d2125", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "#1d2125",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              KS
            </div>
            <div style={{ fontSize: 30, fontWeight: 600 }}>Kursat Shop</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 26, color: "#5f6670" }}>{eyebrow}</div>
            <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
            <div style={{ fontSize: 34, fontWeight: 600 }}>{detail}</div>
          </div>
          <div style={{ fontSize: 22, color: "#8a9099" }}>Demo yedek parça mağazası</div>
        </div>
        {img && (
          <div style={{ width: 420, height: 502, display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f7f8", borderRadius: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} width={380} height={380} alt="" />
          </div>
        )}
      </div>
    ),
    OG_SIZE,
  );
}
