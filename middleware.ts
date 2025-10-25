import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for role-selection page
  if (pathname === '/auth/role-selection') {
    return NextResponse.next();
  }

  // Get Firebase token from cookie
  const firebaseToken = request.cookies.get('firebase-token')?.value;

  // Protect dashboard routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!firebaseToken) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protect listing creation - only skill providers
  if (pathname.startsWith('/listings/new')) {
    if (!firebaseToken) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protect project creation - only project creators
  if (pathname.startsWith('/projects/new')) {
    if (!firebaseToken) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
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
