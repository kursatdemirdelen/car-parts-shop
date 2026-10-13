import { Check } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Progress through the vehicle selector steps. `current` is the index of the first unfilled step
 * (`steps.length` when all are filled).
 */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-3 flex items-center" aria-label="Araç seçimi adımları">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")} aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-[var(--dur-base)]",
                done ? "bg-accent text-white" : active ? "bg-white text-accent ring-2 ring-accent-bright" : "bg-surface-strong text-muted",
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn("ml-1.5 hidden text-xs font-medium sm:inline", done || active ? "text-ink" : "text-muted")}>{label}</span>
            <span className="sr-only">
              {` (adım ${i + 1} / ${steps.length}${done ? ", tamamlandı" : active ? ", şu anki adım" : ""})`}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn("mx-2 h-0.5 flex-1 rounded-full transition-colors duration-[var(--dur-base)]", done ? "bg-accent" : "bg-line")}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
