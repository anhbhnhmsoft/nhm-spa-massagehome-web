import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("SECURE_AUTH_TOKEN")?.value;
  const pathname = req.nextUrl.pathname;

  // Nếu đã login thì không cho vào các route thuộc nhóm auth
  const authRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/auth",
    "/welcome",
  ];

  if (
    token &&
    authRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/verify-otp", "/auth", "/welcome"],
};
