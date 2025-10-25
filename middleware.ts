import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for role-selection page
  if (pathname === '/auth/role-selection') {
    return NextResponse.next();
  }

  // Get JWT token (lightweight, works in Edge)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect dashboard routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // If user hasn't selected role yet, redirect to role selection
    if (!token.userType) {
      return NextResponse.redirect(new URL('/auth/role-selection', request.url));
    }

    // Redirect to role-specific dashboard
    if (pathname === '/dashboard') {
      const dashboardUrl = token.userType === 'SKILL_PROVIDER' 
        ? '/dashboard/provider' 
        : '/dashboard/creator';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Provider-only routes
    if (pathname.startsWith('/dashboard/provider') && token.userType !== 'SKILL_PROVIDER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Creator-only routes
    if (pathname.startsWith('/dashboard/creator') && token.userType !== 'PROJECT_CREATOR' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect listing creation - only skill providers
  if (pathname.startsWith('/listings/new')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (token.userType !== 'SKILL_PROVIDER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect project creation - only project creators
  if (pathname.startsWith('/projects/new')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (token.userType !== 'PROJECT_CREATOR' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/listings/new',
    '/projects/new',
  ],
};
