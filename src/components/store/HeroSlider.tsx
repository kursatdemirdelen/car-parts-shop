"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore, type FocusEvent } from "react";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/format";
import { PHOTOS } from "@/lib/photos";
import type { HeroSlide } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { useHydrated } from "@/state/persistent-store";

const AUTOPLAY_MS = 6000;

const overlays: Record<HeroSlide["tone"], string> = {
  dark: "bg-gradient-to-r from-night/90 via-night/70 to-night/25",
  accent: "bg-gradient-to-r from-accent/95 via-accent/75 to-accent/30",
  light: "bg-gradient-to-r from-white/95 via-white/80 to-white/30",
};

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** One slide's visual: photo, tone overlay, text and optional button. Shared with the admin preview. */
export function HeroSlideView({
  slide,
  priority = false,
  showImage = true,
  className,
}: {
  slide: HeroSlide;
  priority?: boolean;
  /** False keeps the tone background only (used to defer off-screen slides). */
  showImage?: boolean;
  className?: string;
}) {
  const photo = PHOTOS[slide.photo];
  const onDark = slide.tone !== "light";
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-night", className)}>
      {showImage && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority={priority}
          sizes="100vw"
          unoptimized={photo.src.endsWith(".svg")}
          className="object-cover"
        />
      )}
      <div className={cn("absolute inset-0", overlays[slide.tone])} aria-hidden="true" />
      <div className="container-page relative flex h-full flex-col justify-center pt-8 pb-8 md:pt-0 md:pb-14">
        <div className="max-w-xl">
          <h2 className={cn("text-2xl font-semibold tracking-tight text-balance md:text-4xl md:leading-tight", onDark ? "text-white" : "text-ink")}>
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className={cn("mt-2 line-clamp-2 text-sm md:mt-3 md:text-base", onDark ? "text-accent-soft" : "text-ink-soft")}>{slide.subtitle}</p>
          )}
          {slide.ctaLabel && slide.ctaHref && (
            <LinkButton href={slide.ctaHref} variant={onDark ? "secondary" : "primary"} className="mt-4 md:mt-5">
              {slide.ctaLabel}
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Admin-managed storefront carousel. Autoplays every 6 s; pauses on hover, keyboard focus, hidden tab,
 * the pause button and under reduced motion. Only the active slide is exposed to assistive tech.
 */
export function HeroSlider() {
  const { heroSlides } = useCatalog();
  const slides = heroSlides.filter((s) => s.status === "published");
  const count = slides.length;
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  // Off-screen slide photos load only once they have been shown (or are next, after hydration),
  // so they don't compete with the first slide's image (the LCP element).
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([0]));
  const hydrated = useHydrated();
  const show = (i: number) => {
    setIndex(i);
    setVisited((v) => (v.has(i) ? v : new Set(v).add(i)));
  };
  const [playState, setPlayState] = useState<"auto" | "paused" | "playing">("auto");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const playing = playState === "playing" || (playState === "auto" && !reducedMotion);
  const current = count ? index % count : 0;

  useEffect(() => {
    if (!playing || hovered || focused || count < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) {
        setIndex((i) => {
          const next = (i + 1) % count;
          setVisited((v) => (v.has(next) ? v : new Set(v).add(next)));
          return next;
        });
      }
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [playing, hovered, focused, count]);

  if (count === 0) return null;

  const go = (delta: number) => show((current + delta + count) % count);
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
      className="relative h-56 md:h-80"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      <div aria-live={playing ? "off" : "polite"} className="absolute inset-0">
        {slides.map((slide, i) => {
          const active = i === current;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={active ? undefined : true}
              inert={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)]",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              <HeroSlideView
                slide={slide}
                priority={i === 0}
                showImage={i === current || visited.has(i) || (hydrated && i === (current + 1) % count)}
              />
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="container-page pointer-events-none absolute inset-x-0 top-3 flex items-center justify-end gap-2 md:top-auto md:bottom-14">
          <div className="pointer-events-auto flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Slayt ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => show(i)}
                className="flex size-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-[var(--dur-base)] ease-[var(--ease-out)]",
                    i === current ? "w-6 bg-white" : "w-1.5 bg-white/55",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="pointer-events-auto flex items-center gap-1">
            <ControlButton label="Önceki slayt" onClick={() => go(-1)}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </ControlButton>
            <ControlButton label={playing ? "Slaytları durdur" : "Slaytları oynat"} onClick={() => setPlayState(playing ? "paused" : "playing")}>
              {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            </ControlButton>
            <ControlButton label="Sonraki slayt" onClick={() => go(1)}>
              <ChevronRight className="size-4" aria-hidden="true" />
            </ControlButton>
          </div>
        </div>
      )}
    </section>
  );
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full bg-night/55 text-white backdrop-blur-sm transition-colors duration-[var(--dur-fast)] hover:bg-night/80"
    >
      {children}
    </button>
  );
}
