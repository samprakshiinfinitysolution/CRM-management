import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from '@/lib/jwt';
import { UserRole } from '@/types/api.types';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || 'CRM_Management';
  const tokenCookie = request.cookies.get(tokenKey);
  const token = tokenCookie?.value;

  const decoded = token ? decodeJwt(token) : null;
  const isAuthPage = pathname === '/';
  const isTeamLeaderRoute = pathname.startsWith('/team_leader');
  const isSalesExecutiveRoute = pathname.startsWith('/sales_executive');

  // 1. If user is authenticated and attempts to visit the auth page (/), redirect to their portal
  if (isAuthPage && decoded) {
    if (decoded.role === UserRole.TEAM_LEADER) {
      return NextResponse.redirect(new URL('/team_leader', request.url));
    }
    if (decoded.role === UserRole.SALES_EXECUTIVE) {
      return NextResponse.redirect(new URL('/sales_executive', request.url));
    }
  }

  // If on auth page with an invalid/expired token, clear the cookie
  if (isAuthPage && !decoded && token) {
    const response = NextResponse.next();
    response.cookies.delete('token');
    response.cookies.delete(tokenKey);
    return response;
  }

  // 2. Protect /team_leader routes
  if (isTeamLeaderRoute) {
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      response.cookies.delete(tokenKey);
      return response;
    }

    if (decoded.role !== UserRole.TEAM_LEADER) {
      // Role mismatch: Sales Executive attempting to view Team Leader view
      if (decoded.role === UserRole.SALES_EXECUTIVE) {
        return NextResponse.redirect(new URL('/sales_executive', request.url));
      }
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      response.cookies.delete(tokenKey);
      return response;
    }
  }

  // 3. Protect /sales_executive routes
  if (isSalesExecutiveRoute) {
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      response.cookies.delete(tokenKey);
      return response;
    }

    if (decoded.role !== UserRole.SALES_EXECUTIVE) {
      // Role mismatch: Team Leader attempting to view Sales Executive view
      if (decoded.role === UserRole.TEAM_LEADER) {
        return NextResponse.redirect(new URL('/team_leader', request.url));
      }
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      response.cookies.delete(tokenKey);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/team_leader/:path*',
    '/sales_executive/:path*',
  ],
};
