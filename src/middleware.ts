import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_COOKIE_NAME, ADMIN_COOKIE_NAME } from "./lib/constants";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Admin Routes Protection
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isLoginPage = pathname === "/admin/login";

    if (!adminToken && !isLoginPage) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    if (adminToken && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 2. Public routes accessible without authentication
  const isPublicAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/app-download";

  const userToken = request.cookies.get(USER_COOKIE_NAME)?.value;

  // 3. New / Unauthenticated User Gate
  // Any user without active session MUST first login or register to enter the website
  if (!userToken) {
    // If already on a public auth route, allow them to view it
    if (isPublicAuthRoute) {
      return NextResponse.next();
    }

    // Check if user arrived via an invitation/referral link
    const refCode =
      searchParams.get("ref") ||
      searchParams.get("code") ||
      searchParams.get("invite") ||
      searchParams.get("referral") ||
      searchParams.get("invitation") ||
      searchParams.get("referralCode");

    if (refCode) {
      const registerUrl = new URL("/register", request.url);
      registerUrl.searchParams.set("ref", refCode);
      return NextResponse.redirect(registerUrl);
    }

    // Redirect all unauthenticated visitors directly to /login
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logged-in user visiting /login or /register redirects to Home /
  if (userToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static build files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json
     * - static image/asset extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff|woff2)$).*)",
  ],
};
