import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow role selection page without checks
  if (pathname === '/auth/role-selection') {
    return NextResponse.next();
  }
  
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/bookings', '/listings/new', '/projects/new', '/admin'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (!isProtected) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Redirect unauthenticated users
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check role selection
  if (!token.userType && !pathname.startsWith('/auth/role-selection')) {
    return NextResponse.redirect(new URL('/auth/role-selection', request.url));
  }

  // Dashboard redirects
  if (pathname === '/dashboard') {
    // If no userType, redirect to role selection
    if (!token.userType) {
      return NextResponse.redirect(new URL('/auth/role-selection', request.url));
    }
    
    const dashboardUrl = token.userType === 'SKILL_PROVIDER' 
      ? '/dashboard/provider' 
      : '/dashboard/creator';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Provider-only routes
  if (pathname.startsWith('/dashboard/provider') || pathname.startsWith('/listings/new') || pathname.includes('/listings/') && pathname.includes('/edit')) {
    if (token.userType !== 'SKILL_PROVIDER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/creator', request.url));
    }
  }

  // Creator-only routes
  if (pathname.startsWith('/dashboard/creator') || pathname.startsWith('/projects/new') || pathname.includes('/projects/') && pathname.includes('/edit')) {
    if (token.userType !== 'PROJECT_CREATOR' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/provider', request.url));
    }
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/listings/new',
    '/listings/:id/edit',
    '/projects/new',
    '/projects/:id/edit',
    '/bookings/:path*',
    '/admin/:path*',
  ],
};
