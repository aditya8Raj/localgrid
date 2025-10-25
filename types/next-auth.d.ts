import { UserType, UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      userType: UserType;
      role: UserRole;
      isVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    userType: UserType;
    role: UserRole;
    isVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userType: UserType;
    role: UserRole;
    isVerified: boolean;
  }
}
