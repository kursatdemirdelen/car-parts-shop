"use client";

import { RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Keeps a failing section from taking the whole page down: only this block shows a small
 * "couldn't load" card with a retry button.
 */
export class SectionBoundary extends Component<{ children: ReactNode; label?: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[SectionBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-4 py-3 text-sm">
        <span className="min-w-0 flex-1 text-ink-soft">{this.props.label ? `${this.props.label} yüklenemedi.` : "Bu bölüm yüklenemedi."}</span>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-line-strong bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Tekrar dene
        </button>
      </div>
    );
  }
}
