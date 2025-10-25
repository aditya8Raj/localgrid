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

  experimental: {
    enableWebAuthn: false,
  },

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
