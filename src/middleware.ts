import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_COOKIE_NAME, ADMIN_COOKIE_NAME } from "./lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // 2. User Protected Routes
  const protectedUserRoutes = [
    "/recharge",
    "/withdraw",
    "/my-bank",
    "/profile",
    "/personal-info",
    "/change-password",
    "/set-withdraw-password",
    "/orders",
    "/records",
    "/recharge-record",
    "/withdraw-record",
    "/gift-receive",
  ];

  const isProtectedRoute = protectedUserRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const userToken = request.cookies.get(USER_COOKIE_NAME)?.value;

  if (isProtectedRoute && !userToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and visiting login or register, redirect to home
  if (userToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/register",
    "/recharge/:path*",
    "/withdraw/:path*",
    "/my-bank/:path*",
    "/profile/:path*",
    "/personal-info/:path*",
    "/change-password/:path*",
    "/set-withdraw-password/:path*",
    "/records/:path*",
    "/recharge-record/:path*",
    "/withdraw-record/:path*",
    "/gift-receive/:path*",
  ],
};
