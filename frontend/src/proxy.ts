import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "@/lib/jwt";
import { UserRole } from "@/types/api.types";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "CRM_Management";
  const tokenCookie = request.cookies.get(tokenKey);
  const token = tokenCookie?.value;

  const decoded = token ? decodeJwt(token) : null;
  const isAuthPage = pathname === "/" || pathname === "/login";
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLegacyRoute =
    pathname.startsWith("/team_leader") || pathname.startsWith("/sales_executive");

  // Legacy route redirection
  if (isLegacyRoute) {
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 1. Auth pages (/ and /login)
  if (isAuthPage) {
    if (decoded) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected /dashboard routes
  if (isDashboardRoute) {
    if (!decoded) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete(tokenKey);
      return response;
    }

    const isTeamLeader = decoded.role === UserRole.TEAM_LEADER;
    const isSalesExecutive = decoded.role === UserRole.SALES_EXECUTIVE;

    // Team Leader Only Routes
    const tlOnlyRoutes = [
      "/dashboard/leads/create",
      "/dashboard/distributions",
      "/dashboard/users",
      "/dashboard/reports",
      "/dashboard/imports",
      "/dashboard/audit-logs",
    ];

    const isTLOnly = tlOnlyRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isTLOnly && !isTeamLeader) {
      // Sales executive attempting to access TL-only section
      return NextResponse.redirect(new URL("/dashboard/my-leads", request.url));
    }

    // Sales Executive Only Routes
    if (pathname.startsWith("/dashboard/my-leads") && !isSalesExecutive) {
      return NextResponse.redirect(new URL("/dashboard/leads", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/team_leader/:path*",
    "/sales_executive/:path*",
  ],
};
