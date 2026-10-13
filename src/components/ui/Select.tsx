import type { LucideIcon } from "lucide-react";
import { createElement, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { controlClass } from "./control";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type SelectProps = Omit<ComponentProps<"select">, "children"> & {
  options?: SelectOption[];
  /** Icon shown inside the field on the left, in every browser. */
  leadingIcon?: LucideIcon;
  placeholder?: string;
  wrapperClassName?: string;
  children?: ReactNode;
};

/**
 * Native <select>: keyboard, screen readers and form behaviour stay the browser's. Options are plain
 * text everywhere (rich option markup breaks hydration and is dropped by legacy parsers); where
 * `appearance: base-select` is supported the picker list is styled to the brand (see globals.css).
 */
export function Select({ className, wrapperClassName, options, leadingIcon, placeholder, children, value, ...props }: SelectProps) {
  const field = (
    <select
      value={value}
      className={cn(
        controlClass,
        "ks-select h-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2356636c%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9",
        leadingIcon && "pl-9",
        value !== undefined && value !== "" && "border-accent/60",
        className,
      )}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options?.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
      {children}
    </select>
  );
  if (!leadingIcon) return field;
  return (
    <div className={cn("relative min-w-0", wrapperClassName)}>
      {createElement(leadingIcon, {
        className: "pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-accent-bright",
        "aria-hidden": true,
      })}
      {field}
    </div>
  );
}
