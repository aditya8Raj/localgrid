import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isCorrectPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name || undefined,
          image: user.image || undefined,
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, check if user needs onboarding
      if (account?.provider !== "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { userType: true, createdAt: true }
        })
        
        // If user is new (within 5 seconds of creation) and still has default userType,
        // they need to complete onboarding
        if (dbUser) {
          const isNewUser = Date.now() - dbUser.createdAt.getTime() < 5000
          if (isNewUser && dbUser.userType === 'SKILL_PROVIDER') {
            // Store a flag that user needs onboarding
            // This will be checked in the JWT callback
            return true
          }
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      
      // Always fetch latest userType from database
      // This ensures we get updated values after onboarding
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { userType: true, role: true, isVerified: true, createdAt: true }
        })
        
        if (dbUser) {
          token.userType = dbUser.userType
          token.role = dbUser.role
          token.isVerified = dbUser.isVerified
          
          // Check if user needs onboarding
          const isNewUser = Date.now() - dbUser.createdAt.getTime() < 60000 // Within 1 minute
          token.needsOnboarding = isNewUser && dbUser.userType === 'SKILL_PROVIDER'
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        session.user.userType = token.userType as 'SKILL_PROVIDER' | 'PROJECT_CREATOR'
        session.user.role = token.role as 'USER' | 'MODERATOR' | 'ADMIN'
        session.user.isVerified = token.isVerified as boolean
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})
