import { cookies } from 'next/headers';
import { prisma } from './prisma';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  userType: 'SKILL_PROVIDER' | 'PROJECT_CREATOR' | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isVerified: boolean;
}

/**
 * Get the authenticated user from cookies (for Server Components & API Routes)
 * This replaces NextAuth's auth() function
 */
export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    
    if (!userEmail) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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

    return user as User | null;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Use in API routes that require authentication
 */
export async function requireAuth(): Promise<User> {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Require specific user type
 * Use in API routes that require specific permissions
 */
export async function requireUserType(userType: 'SKILL_PROVIDER' | 'PROJECT_CREATOR'): Promise<User> {
  const user = await requireAuth();
  
  if (user.userType !== userType && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  
  return user;
}
