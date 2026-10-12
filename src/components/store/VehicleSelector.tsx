"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { engines, generations, makes, models, vehicleLabel, years } from "@/lib/catalog/vehicles";
import { cn } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { garageActions } from "@/state/garage-store";

interface VehicleSelectorProps {
  layout?: "inline" | "stacked";
  /** "navigate": save, select and open the fitting catalog. "stay": save and select only. */
  mode?: "navigate" | "stay";
  submitLabel?: string;
  onSelected?: (v: Vehicle) => void;
  className?: string;
}

/**
 * Step-by-step vehicle picker: make → model → generation → year → engine.
 * Each step only offers options that exist in the demo vehicle data for the previous choices.
 */
export function VehicleSelector({
  layout = "inline",
  mode = "navigate",
  submitLabel = "Parçaları göster",
  onSelected,
  className,
}: VehicleSelectorProps) {
  const { vehicles } = useCatalog();
  const router = useRouter();
  const toast = useToast();
  const id = useId();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [generation, setGeneration] = useState("");
  const [year, setYear] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const makeOptions = useMemo(() => makes(vehicles), [vehicles]);
  const modelOptions = useMemo(() => (make ? models(vehicles, make) : []), [vehicles, make]);
  const generationOptions = useMemo(() => (model ? generations(vehicles, make, model) : []), [vehicles, make, model]);
  // The current year is only needed after a generation is chosen, i.e. in the browser.
  const yearOptions = useMemo(
    () => (generation ? years(vehicles, make, model, generation, new Date().getFullYear()) : []),
    [vehicles, make, model, generation],
  );
  const engineOptions = useMemo(
    () => (year ? engines(vehicles, make, model, generation, Number(year)) : []),
    [vehicles, make, model, generation, year],
  );

  const generationLabel = (g: string) => {
    const v = vehicles.find((x) => x.make === make && x.model === model && x.generation === g);
    if (!v) return g;
    return `${g}${v.body ? ` ${v.body}` : ""} (${v.yearFrom}–${v.yearTo ?? ""})`;
  };

  const reset = () => {
    setMake("");
    setModel("");
    setGeneration("");
    setYear("");
    setVehicleId("");
  };

  const submit = () => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;
    garageActions.choose(vehicle.id);
    toast.show(`${vehicleLabel(vehicle)} garajına eklendi ve seçildi.`);
    onSelected?.(vehicle);
    if (mode === "navigate") router.push("/products?fit=1");
    reset();
  };

  const steps = [
    {
      key: "make",
      label: "Marka",
      value: make,
      placeholder: "Marka seç",
      disabled: false,
      options: makeOptions.map((m) => ({ value: m, label: m })),
      onChange: (v: string) => {
        setMake(v);
        setModel("");
        setGeneration("");
        setYear("");
        setVehicleId("");
      },
    },
    {
      key: "model",
      label: "Model",
      value: model,
      placeholder: "Model seç",
      disabled: !make,
      options: modelOptions.map((m) => ({ value: m, label: m })),
      onChange: (v: string) => {
        setModel(v);
        setGeneration("");
        setYear("");
        setVehicleId("");
      },
    },
    {
      key: "generation",
      label: "Kasa / Nesil",
      value: generation,
      placeholder: "Kasa seç",
      disabled: !model,
      options: generationOptions.map((g) => ({ value: g, label: generationLabel(g) })),
      onChange: (v: string) => {
        setGeneration(v);
        setYear("");
        setVehicleId("");
      },
    },
    {
      key: "year",
      label: "Yıl",
      value: year,
      placeholder: "Yıl seç",
      disabled: !generation,
      options: yearOptions.map((y) => ({ value: String(y), label: String(y) })),
      onChange: (v: string) => {
        setYear(v);
        setVehicleId("");
      },
    },
    {
      key: "engine",
      label: "Motor",
      value: vehicleId,
      placeholder: "Motor seç",
      disabled: !year,
      options: engineOptions.map((v) => ({ value: v.id, label: v.engine })),
      onChange: (v: string) => setVehicleId(v),
    },
  ];

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div
        className={cn(
          "grid gap-2.5",
          layout === "inline" ? "sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]" : "grid-cols-1",
        )}
      >
        {steps.map((step, i) => (
          <div key={step.key} className="min-w-0">
            <label htmlFor={`${id}-${step.key}`} className={cn("mb-1 block text-xs font-medium text-muted", layout === "inline" && "lg:sr-only")}>
              {i + 1}. {step.label}
            </label>
            <Select
              id={`${id}-${step.key}`}
              value={step.value}
              disabled={step.disabled}
              onChange={(e) => step.onChange(e.target.value)}
              className={cn(step.value && "border-ink")}
            >
              <option value="">{layout === "inline" ? `${i + 1}. ${step.placeholder}` : step.placeholder}</option>
              {step.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
        <div className={cn("flex items-end gap-2", layout === "inline" && "sm:col-span-2 lg:col-span-1")}>
          <Button type="submit" disabled={!vehicleId} className="flex-1 lg:flex-none">
            {submitLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          {make && (
            <Button variant="ghost" onClick={reset} aria-label="Seçimi sıfırla" className="px-3">
              <RotateCcw className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">Yalnızca demo veri setindeki araçlar listelenir; bu tam bir araç veritabanı değildir.</p>
    </form>
  );
}
