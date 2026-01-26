import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to route users based on authentication cookie.
 * - If no token and requesting non-/auth route -> redirect to /auth/index
 * - If has token and requesting /auth route -> redirect to /
 * - Allow requests to Next.js internals and public assets
 */
export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Allow Next internals, API and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("SECURE_AUTH_TOKEN")?.value;

  // Not authenticated -> force auth page
  if (!token && !pathname.startsWith("/auth")) {
    const url = new URL("/auth/index", req.url);
    return NextResponse.redirect(url);
  }

  // Authenticated users shouldn't stay on auth pages
  if (token && pathname.startsWith("/auth")) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
