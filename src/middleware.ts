import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/join',
    '/auth/join/provider',
    '/auth/join/creator',
    '/auth/onboarding',
    '/auth/error',
    '/api/auth',
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes and API auth routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to signin if not authenticated
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Get user type and role
  const userType = token.userType as string;
  const role = token.role as string;
  
  // Allow onboarding route
  if (pathname.startsWith('/auth/onboarding')) {
    return NextResponse.next();
  }

  // Redirect to onboarding if user hasn't selected their role
  // This applies to first-time OAuth users who haven't gone through role selection
  if (!userType || (userType === 'SKILL_PROVIDER' && token.needsOnboarding)) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  // Role-based route protection

  // Skill Provider routes
  if (pathname.startsWith('/dashboard/provider')) {
    if (userType !== 'SKILL_PROVIDER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Project Creator routes
  if (pathname.startsWith('/dashboard/creator')) {
    if (userType !== 'PROJECT_CREATOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    // Admin routes are handled separately with .env authentication
    // This middleware only checks regular user sessions
    return NextResponse.next();
  }

  // Listings creation (Skill Providers only)
  if (pathname.startsWith('/listings/new')) {
    if (userType !== 'SKILL_PROVIDER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/listings', request.url));
    }
  }

  // Projects creation (Project Creators only)
  if (pathname.startsWith('/projects/new')) {
    if (userType !== 'PROJECT_CREATOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/projects', request.url));
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
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
