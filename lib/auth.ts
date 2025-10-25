import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import type { Adapter } from 'next-auth/adapters';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // Use JWT for middleware (lightweight, Edge compatible)
  // But still use database for sessions (fresh data)
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Generate JWT tokens for middleware to read
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }

      // When user updates their role, refetch from database
      if (trigger === 'update' || !token.userType) {
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
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
      }

      return token;
    },

    async session({ session, user }) {
      // Always fetch fresh user data from database for server components
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
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

      if (dbUser && session.user) {
        session.user.id = dbUser.id;
        session.user.userType = dbUser.userType;
        session.user.role = dbUser.role;
        session.user.isVerified = dbUser.isVerified;
      }

      return session;
    },
  },

  events: {
    async createUser({ user }) {
      console.log('[Auth] New user created:', user.email);
    },
  },

  debug: process.env.NODE_ENV === 'development',
});
