import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("SECURE_AUTH_TOKEN")?.value;
  const { pathname } = req.nextUrl;
  const authRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/auth",
    "/welcome",
    ,
  ];
  const publicRoutes = ["/", "/term-or-use-pdf", ...authRoutes];
  if (
    token &&
    authRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|assets).*)"],
};
