/** Public base URL of the deployment (set NEXT_PUBLIC_SITE_URL in production). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const REPO_URL = "https://github.com/kursatdemirdelen/car-parts-shop";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
