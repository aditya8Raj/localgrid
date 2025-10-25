import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import type { UserType, UserRole } from '@prisma/client';
import type { Adapter } from 'next-auth/adapters';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      checks: ["none"], // Disable PKCE checks temporarily
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  useSecureCookies: process.env.NODE_ENV === 'production',

  cookies: {
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  trustHost: true,

  callbacks: {
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const session = auth;

      // Public routes
      const publicRoutes = ['/', '/auth/signin', '/auth/role-selection', '/auth/error'];
      const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));

      if (isPublicRoute) return true;

      // Require authentication
      if (!session?.user) {
        return false; // NextAuth will redirect to signin
      }

      // Require role selection
      if (!session.user.userType && !pathname.startsWith('/auth/role-selection')) {
        return Response.redirect(new URL('/auth/role-selection', request.url));
      }

      // Provider-only routes
      if (pathname.startsWith('/dashboard/provider') || pathname.startsWith('/listings/new') || pathname.includes('/listings/') && pathname.includes('/edit')) {
        if (session.user.userType !== 'SKILL_PROVIDER' && session.user.role !== 'ADMIN') {
          return Response.redirect(new URL('/dashboard/creator', request.url));
        }
      }

      // Creator-only routes
      if (pathname.startsWith('/dashboard/creator') || pathname.startsWith('/projects/new') || pathname.includes('/projects/') && pathname.includes('/edit')) {
        if (session.user.userType !== 'PROJECT_CREATOR' && session.user.role !== 'ADMIN') {
          return Response.redirect(new URL('/dashboard/provider', request.url));
        }
      }

      // Redirect /dashboard to role-specific dashboard
      if (pathname === '/dashboard') {
        const dashboardUrl = session.user.userType === 'SKILL_PROVIDER' 
          ? '/dashboard/provider' 
          : '/dashboard/creator';
        return Response.redirect(new URL(dashboardUrl, request.url));
      }

      return true;
    },

    async signIn({ user, account }) {
      // For OAuth providers, check if user has selected role
      if (account?.provider === 'google') {
        // Check if this is a new user or existing user
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, userType: true },
        });

        // If user doesn't have userType set, they need to select their role
        // Pass the user ID in the URL so we can identify them
        if (existingUser && !existingUser.userType) {
          return `/auth/role-selection?userId=${existingUser.id}`;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            userType: true,
            role: true,
            isVerified: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.userType = dbUser.userType;
          token.role = dbUser.role;
          token.isVerified = dbUser.isVerified;
        }
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as UserType;
        session.user.role = token.role as UserRole;
        session.user.isVerified = token.isVerified as boolean;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle OAuth callback redirects
      if (url.startsWith('/auth/signup')) {
        return url;
      }

      // After sign in, redirect to role-specific dashboard
      if (url === baseUrl || url.startsWith(baseUrl)) {
        return baseUrl;
      }

      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Allow same origin URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },

  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
  },

  debug: false, // Disabled to reduce terminal noise
});
