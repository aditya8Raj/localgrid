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

  // Use database sessions instead of JWT for reliability
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async session({ session, user }) {
      // Fetch fresh user data from database on every session call
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
        session.user.userType = dbUser.userType as 'SKILL_PROVIDER' | 'PROJECT_CREATOR' | null;
        session.user.role = dbUser.role as 'USER' | 'MODERATOR' | 'ADMIN';
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
