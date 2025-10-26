import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user email from cookie (set by Firebase auth context)
  const userEmail = request.cookies.get('userEmail')?.value;

  // Fetch user data from database if we have email
  let user = null;
  if (userEmail) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/user?email=${userEmail}`, {
        headers: {
          'Cookie': request.headers.get('Cookie') || '',
        },
      });
      if (response.ok) {
        user = await response.json();
      }
    } catch (error) {
      console.error('[Middleware] Error fetching user:', error);
    }
  }

  // Public routes - allow access without auth
  if (pathname === '/auth/signin' || pathname === '/auth/error' || pathname === '/') {
    // If already authenticated and on signin page, redirect to appropriate dashboard
    if (user && pathname === '/auth/signin') {
      if (!user.userType) {
        return NextResponse.redirect(new URL('/auth/role-selection', request.url));
      }
      const dashboardUrl = user.userType === 'SKILL_PROVIDER'
        ? '/dashboard/provider'
        : '/dashboard/creator';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // Role selection page - require auth but not role
  if (pathname === '/auth/role-selection') {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    // If already has role, redirect to dashboard
    if (user.userType) {
      const dashboardUrl = user.userType === 'SKILL_PROVIDER'
        ? '/dashboard/provider'
        : '/dashboard/creator';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/listings/new') || 
      pathname.startsWith('/projects/new')) {
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // If no userType, redirect to role selection
    if (!user.userType) {
      return NextResponse.redirect(new URL('/auth/role-selection', request.url));
    }

    // Role-based dashboard protection
    if (pathname.startsWith('/dashboard/provider')) {
      if (user.userType !== 'SKILL_PROVIDER' && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/creator', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/creator')) {
      if (user.userType !== 'PROJECT_CREATOR' && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/provider', request.url));
      }
    }

    // Protect listing creation - only skill providers
    if (pathname.startsWith('/listings/new')) {
      if (user.userType !== 'SKILL_PROVIDER' && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/creator', request.url));
      }
    }

    // Protect project creation - only project creators
    if (pathname.startsWith('/projects/new')) {
      if (user.userType !== 'PROJECT_CREATOR' && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/provider', request.url));
      }
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
