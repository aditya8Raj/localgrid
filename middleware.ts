import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for role-selection page
  if (pathname === '/auth/role-selection') {
    return NextResponse.next();
  }

  // Get session from database
  const session = await auth();

  // Protect dashboard routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // If user hasn't selected role yet, redirect to role selection
    if (!session.user.userType) {
      return NextResponse.redirect(new URL('/auth/role-selection', request.url));
    }

    // Redirect to role-specific dashboard
    if (pathname === '/dashboard') {
      const dashboardUrl = session.user.userType === 'SKILL_PROVIDER' 
        ? '/dashboard/provider' 
        : '/dashboard/creator';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Provider-only routes
    if (pathname.startsWith('/dashboard/provider') && session.user.userType !== 'SKILL_PROVIDER' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Creator-only routes
    if (pathname.startsWith('/dashboard/creator') && session.user.userType !== 'PROJECT_CREATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect listing creation - only skill providers
  if (pathname.startsWith('/listings/new')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (session.user.userType !== 'SKILL_PROVIDER' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect project creation - only project creators
  if (pathname.startsWith('/projects/new')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (session.user.userType !== 'PROJECT_CREATOR' && session.user.role !== 'ADMIN') {
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
