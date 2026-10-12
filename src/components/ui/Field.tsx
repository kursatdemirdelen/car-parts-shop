import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

const control =
  "w-full rounded-[var(--radius-control)] border border-line-strong bg-white px-3 text-sm text-ink placeholder:text-subtle transition-colors hover:border-subtle focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 disabled:bg-surface disabled:text-subtle aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "h-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235f6670%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9",
        className,
      )}
      {...props}
    />
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft", className)}>
      <input type="checkbox" className="size-4 shrink-0 cursor-pointer accent-[var(--color-ink)]" {...props} />
      <span className="min-w-0">{label}</span>
    </label>
  );
}

/** Accessible toggle switch built on a checkbox with role="switch". */
export function Switch({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink", className)}>
      <span className="relative inline-flex">
        <input type="checkbox" role="switch" className="peer sr-only" {...props} />
        <span className="h-5 w-9 rounded-full bg-line-strong transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2" />
        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span>{label}</span>
    </label>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint/error. The control should set `aria-describedby={fieldDescribedBy(id, error, hint)}`. */
export function FormField({ label, htmlFor, error, hint, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function fieldDescribedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
