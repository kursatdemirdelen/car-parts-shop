/**
 * Design tokens: the single source the contrast test reads. `src/app/globals.css` mirrors these values
 * in `@theme` (a test checks they stay in sync).
 */

/** Brand palette chosen by the project owner. */
export const PALETTE = { night: "#1B262C", deep: "#0F4C75", bright: "#3282B8", ice: "#BBE1FA" } as const;

const WHITE = "#ffffff";

/** Color tokens by name (CSS variable `--color-<name>`). */
export const TOKENS = {
  bg: WHITE,
  surface: "#f5f8fa",
  "surface-strong": "#e8eef2",
  ink: PALETTE.night,
  "ink-soft": "#34424b",
  muted: "#56636c",
  subtle: "#64717a",
  line: "#e1e7ec",
  "line-strong": "#c9d3da",
  primary: PALETTE.deep,
  "primary-hover": "#0b3a5a",
  accent: PALETTE.deep,
  "accent-hover": "#0b3a5a",
  "accent-bright": PALETTE.bright,
  "accent-soft": PALETTE.ice,
  night: PALETTE.night,
  "cat-oem": PALETTE.deep,
  "cat-oem-soft": "#e3f2fc",
  "cat-perf": "#b4361a",
  "cat-perf-soft": "#fdede8",
  "cat-care": "#1f7a4d",
  "cat-care-soft": "#e8f5ee",
  success: "#1f7a4d",
  "success-soft": "#eef7f1",
  danger: "#b42318",
  "danger-soft": "#fdf1f0",
  warn: "#8a5a00",
  "warn-soft": "#fdf6e7",
} as const;

const t = TOKENS;

/** Every foreground/background pairing used for text, with its WCAG minimum (4.5 normal text, 3 large text). */
export const TEXT_PAIRS: [fg: string, bg: string, minRatio: number][] = [
  [t.ink, t.bg, 4.5],
  [t.ink, t.surface, 4.5],
  [t["ink-soft"], t.bg, 4.5],
  [t.muted, t.bg, 4.5],
  [t.muted, t.surface, 4.5],
  [t.subtle, t.bg, 4.5],
  [t.accent, t.bg, 4.5],
  [t.accent, t.surface, 4.5],
  [WHITE, t.accent, 4.5],
  [WHITE, t["accent-hover"], 4.5],
  [t.accent, t["accent-soft"], 4.5],
  [t.ink, t["accent-soft"], 4.5],
  [WHITE, t.night, 4.5],
  [t["accent-soft"], t.night, 4.5],
  [t["cat-oem"], t.bg, 4.5],
  [t["cat-oem"], t["cat-oem-soft"], 4.5],
  [t["cat-perf"], t.bg, 4.5],
  [t["cat-perf"], t["cat-perf-soft"], 4.5],
  [t["cat-care"], t.bg, 4.5],
  [t["cat-care"], t["cat-care-soft"], 4.5],
  [t.success, t["success-soft"], 4.5],
  [t.danger, t["danger-soft"], 4.5],
  [t.warn, t["warn-soft"], 4.5],
  [WHITE, t.danger, 4.5],
  // Large headline accents only (≥ 24 px).
  [PALETTE.bright, t.bg, 3],
];

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
