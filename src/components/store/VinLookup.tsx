"use client";

import { ScanLine } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { vehicleLabel, yearRange } from "@/lib/catalog/vehicles";
import { cn } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { decodeVin, vehiclesForVin, type VinResult } from "@/lib/vin";
import { useCatalog } from "@/state/catalog-store";
import { VinExplainer } from "./VinExplainer";

export const EXAMPLE_VIN = "WBAEV33435KR12345";

/**
 * Lets the shopper enter a VIN. Only the manufacturer and model year are decoded (public standard);
 * the matching demo vehicles are listed so the shopper picks the exact body and engine.
 */
export function VinLookup({
  onChoose,
  explain = false,
  initialValue = "",
}: {
  onChoose: (v: Vehicle) => void;
  /** Also show the character-by-character breakdown (used on /sasi-sorgula). */
  explain?: boolean;
  initialValue?: string;
}) {
  const { vehicles } = useCatalog();
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const [result, setResult] = useState<VinResult | null>(null);
  const [matches, setMatches] = useState<{ likely: Vehicle[]; others: Vehicle[] }>({ likely: [], others: [] });

  const run = (input: string) => {
    const year = new Date().getFullYear();
    const r = decodeVin(input, year);
    setResult(r);
    setMatches(vehiclesForVin(r, vehicles, year));
  };

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
        }}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor={`${id}-vin`} className="mb-1 block text-xs font-medium text-muted">
            Şasi numarası (17 karakter) · <span className="tabular">{value.replace(/[\s-]/g, "").length}/17</span>
          </label>
          <Input
            id={`${id}-vin`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="characters"
            placeholder="örn. WBAEV33435KR12345"
            className="font-mono tracking-wider uppercase"
            aria-invalid={!!result && !result.valid}
            aria-describedby={result?.message ? `${id}-msg` : undefined}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1 sm:flex-none">
            <ScanLine className="size-4" aria-hidden="true" />
            Çözümle
          </Button>
          {explain && (
            <Button
              variant="secondary"
              onClick={() => {
                setValue(EXAMPLE_VIN);
                run(EXAMPLE_VIN);
              }}
            >
              Örnek ile dene
            </Button>
          )}
        </div>
      </form>

      {result && (
        <div aria-live="polite" className="space-y-4">
          {result.message && (
            <p id={`${id}-msg`} className={cn("text-sm", result.valid ? "text-ink-soft" : "text-danger")}>
              {result.message}
            </p>
          )}

          {result.valid && (
            <>
              {explain && <VinExplainer result={result} />}
              <dl className="grid gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Üretici</dt>
                  <dd className="font-medium text-ink">{result.make ?? "Bilinmiyor"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Model yılı (tahmini)</dt>
                  <dd className="font-medium text-ink tabular">{result.modelYears.length ? result.modelYears.join(" veya ") : "Çözülemedi"}</dd>
                </div>
                <p className="text-xs leading-relaxed text-muted sm:col-span-2">
                  Model, kasa ve motor şasi numarasının üreticiye özel kısmındadır; bu demoda çözülmez. Model yılı Avrupa araçlarında her
                  zaman kodlanmadığı için yalnızca tahmindir. Aşağıdan aracını seç.
                </p>
              </dl>

              {result.make &&
                (matches.likely.length + matches.others.length > 0 ? (
                  <div className="space-y-4">
                    {matches.likely.length > 0 && (
                      <VehicleChoices title="Tahmini model yılına uyan demo araçlar" vehicles={matches.likely} onChoose={onChoose} />
                    )}
                    {matches.others.length > 0 && (
                      <VehicleChoices
                        title={matches.likely.length ? `Diğer ${result.make} araçları` : `${result.make} demo araçları`}
                        vehicles={matches.others}
                        onChoose={onChoose}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Demo veri setinde bu üreticiye ait araç yok.{" "}
                    <Link href="/garage" className="font-medium text-ink underline underline-offset-2">
                      Adım adım seçmeyi dene
                    </Link>
                    .
                  </p>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VehicleChoices({ title, vehicles, onChoose }: { title: string; vehicles: Vehicle[]; onChoose: (v: Vehicle) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{title}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {vehicles.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => onChoose(v)}
              className="flex w-full flex-col rounded-[var(--radius-control)] border border-line px-3 py-2 text-left text-sm hover:border-ink"
            >
              <span className="font-medium text-ink">{vehicleLabel(v)}</span>
              <span className="text-xs text-muted tabular">{yearRange(v)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
