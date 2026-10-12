"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  /** Shown as the card title on small screens. */
  primary?: boolean;
  /** Hidden in the small-screen card view. */
  hideOnMobile?: boolean;
}

export interface SortState {
  key: string;
  dir: "asc" | "desc";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: SortState;
  onSortChange?: (s: SortState) => void;
  empty: ReactNode;
  caption: string;
  onRowClick?: (row: T) => void;
}

/** Table on md+ screens, stacked cards below md (no horizontal page overflow). */
export function DataTable<T>({ columns, rows, rowKey, sort, onSortChange, empty, caption, onRowClick }: DataTableProps<T>) {
  if (rows.length === 0) return <>{empty}</>;

  const toggleSort = (key: string) => {
    if (!onSortChange) return;
    onSortChange(sort?.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const actions = columns.find((c) => c.key === "actions");

  return (
    <>
      <div className="relative hidden overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-surface/70 text-left text-xs text-muted">
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn("px-4 py-2.5 font-medium whitespace-nowrap", c.className)}
                    aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                  >
                    {c.sortable && onSortChange ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-ink">
                        {c.header}
                        {active ? (
                          sort!.dir === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("align-middle", onRowClick && "cursor-pointer hover:bg-surface/60")}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-[var(--radius-card)] border border-line bg-white p-4">
            <div
              className={cn("text-sm font-medium text-ink", onRowClick && "cursor-pointer")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {primary.cell(row)}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {columns
                .filter((c) => c !== primary && c !== actions && !c.hideOnMobile)
                .map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="text-xs text-muted">{c.header}</dt>
                    <dd className="mt-0.5 text-ink">{c.cell(row)}</dd>
                  </div>
                ))}
            </dl>
            {actions && <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">{actions.cell(row)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}

export function SummaryCard({ label, value, hint, href }: { label: string; value: ReactNode; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </>
  );
  const cls = "block rounded-[var(--radius-card)] border border-line bg-white p-4 md:p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-ink")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Card wrapper for admin sections. */
export function Panel({ title, description, actions, children, className }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-line bg-white", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
