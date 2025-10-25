import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image: string
      userType: 'SKILL_PROVIDER' | 'PROJECT_CREATOR'
      role: 'USER' | 'MODERATOR' | 'ADMIN'
      isVerified: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    userType?: 'SKILL_PROVIDER' | 'PROJECT_CREATOR'
    role?: 'USER' | 'MODERATOR' | 'ADMIN'
    isVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name?: string | null
    picture?: string | null
    userType?: 'SKILL_PROVIDER' | 'PROJECT_CREATOR'
    role?: 'USER' | 'MODERATOR' | 'ADMIN'
    isVerified?: boolean
  }
}
