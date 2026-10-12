import { cn } from "@/lib/format";
import type { VinResult } from "@/lib/vin";

/** The 17 characters as monospace boxes grouped by segment, with what was (and was not) decoded. */
export function VinExplainer({ result }: { result: VinResult }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-4">
      <ol className="flex flex-wrap gap-x-3 gap-y-4" aria-label="Şasi numarası bölümleri">
        {result.segments.map((s) => (
          <li key={s.key} className="min-w-0">
            <div className="flex gap-0.5" aria-hidden="true">
              {s.value.split("").map((ch, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-9 w-7 items-center justify-center rounded border font-mono text-sm font-semibold",
                    s.decoded && s.key !== "year" && "border-ink bg-ink text-white",
                    s.decoded && s.key === "year" && "border-ink bg-white text-ink",
                    !s.decoded && "border-line-strong bg-surface text-ink-soft",
                  )}
                >
                  {ch}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-xs font-medium text-ink">
              {s.label} <span className="font-normal text-muted tabular">({s.from === s.to ? s.from : `${s.from}–${s.to}`})</span>
            </p>
            <p className={cn("text-xs", s.decoded && s.key !== "year" ? "text-success" : "text-muted")}>
              <span className="sr-only">{s.value}: </span>
              {s.decoded
                ? s.key === "year"
                  ? `Tahmin: ${s.decoded.replace(" (tahmini)", "")}`
                  : `Çözüldü: ${s.decoded}`
                : s.key === "serial"
                  ? "Aracın sıra numarası"
                  : "Üreticiye özel – çözülemedi"}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
