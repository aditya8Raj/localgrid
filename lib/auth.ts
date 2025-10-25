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

  // Use JWT strategy
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
  },

  trustHost: true,

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.userType = user.userType;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }

      // When user updates their role OR token has no userType, refetch from database
      if (trigger === 'update' || (!token.userType && token.email)) {
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

      return token;
    },

    async session({ session, token }) {
      // Map JWT token data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.userType = token.userType as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any;
        session.user.isVerified = token.isVerified as boolean;
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
