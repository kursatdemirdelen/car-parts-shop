import { createElement, type ComponentType } from "react";

/** Decorative empty-state art: concentric palette rings with the icon in the middle. */
export function EmptyIllustration({ icon }: { icon: ComponentType<{ className?: string }> }) {
  return (
    <span className="relative mb-5 flex size-24 items-center justify-center" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-accent-soft/60" />
      <span className="absolute inset-3 rounded-full bg-accent-soft" />
      <span className="absolute -top-1 right-2 size-3 rounded-full bg-accent-bright/70" />
      <span className="absolute bottom-2 -left-1 size-2 rounded-full bg-accent/40" />
      <span className="relative flex size-12 items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-lift)]">
        {createElement(icon, { className: "size-6" })}
      </span>
    </span>
  );
}
