import { NextResponse, type NextRequest } from "next/server";
import { oemRedirectPath } from "@/lib/seo";

/** One canonical URL per OEM number, with a real 308 before rendering ("/oem/34.11.6.860.912" → "/oem/34116860912"). */
export function proxy(request: NextRequest) {
  const target = oemRedirectPath(request.nextUrl.pathname);
  if (!target) return NextResponse.next();
  return NextResponse.redirect(new URL(target, request.url), 308);
}

export const config = {
  matcher: "/oem/:path*",
};
