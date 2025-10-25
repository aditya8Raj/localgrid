import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/auth/signin', '/auth/role-selection', '/auth/error'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to signin
  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has selected their role
  if (!session.user.userType && !pathname.startsWith('/auth/role-selection')) {
    return NextResponse.redirect(new URL('/auth/role-selection', request.url));
  }

  // Provider-only routes
  if (pathname.startsWith('/dashboard/provider')) {
    if (session.user.userType !== 'SKILL_PROVIDER' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/creator', request.url));
    }
  }

  // Creator-only routes
  if (pathname.startsWith('/dashboard/creator')) {
    if (session.user.userType !== 'PROJECT_CREATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/provider', request.url));
    }
  }

  // Redirect /dashboard to role-specific dashboard
  if (pathname === '/dashboard') {
    const dashboardUrl = session.user.userType === 'SKILL_PROVIDER' 
      ? '/dashboard/provider' 
      : '/dashboard/creator';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Listing creation is for providers only
  if (pathname.startsWith('/listings/new') || pathname.startsWith('/listings/edit')) {
    if (session.user.userType !== 'SKILL_PROVIDER' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/creator', request.url));
    }
  }

  // Project creation is for creators only
  if (pathname.startsWith('/projects/new') || pathname.startsWith('/projects/edit')) {
    if (session.user.userType !== 'PROJECT_CREATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/provider', request.url));
    }
  }

  // Admin-only routes
  if (pathname.startsWith('/admin')) {
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
