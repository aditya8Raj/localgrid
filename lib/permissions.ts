import { UserType, UserRole } from '@prisma/client';

/**
 * Session user type for NextAuth
 */
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  userType: UserType;
  role: UserRole;
  isVerified: boolean;
}

/**
 * Check if user can create listings (Skill Providers only)
 */
export function canCreateListing(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.userType === 'SKILL_PROVIDER' || user.role === 'ADMIN';
}

/**
 * Check if user can create projects (Project Creators only)
 */
export function canCreateProject(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.userType === 'PROJECT_CREATOR' || user.role === 'ADMIN';
}

/**
 * Check if user can book sessions (Project Creators only)
 */
export function canBookSession(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.userType === 'PROJECT_CREATOR' || user.role === 'ADMIN';
}

/**
 * Check if user can accept bookings (Skill Providers only)
 */
export function canAcceptBooking(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.userType === 'SKILL_PROVIDER' || user.role === 'ADMIN';
}

/**
 * Check if user is admin
 */
export function isAdmin(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN';
}

/**
 * Check if user is moderator or admin
 */
export function isModerator(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.role === 'MODERATOR' || user.role === 'ADMIN';
}

/**
 * Get default dashboard route based on user type
 */
export function getDefaultDashboard(userType: UserType): string {
  return userType === 'SKILL_PROVIDER' 
    ? '/dashboard/provider' 
    : '/dashboard/creator';
}

/**
 * Check if user owns a resource
 */
export function isOwner(user: SessionUser | null, ownerId: string): boolean {
  if (!user) return false;
  return user.id === ownerId || user.role === 'ADMIN';
}

/**
 * Get user's available actions based on their type
 */
export function getUserActions(user: SessionUser | null): {
  canCreateListing: boolean;
  canCreateProject: boolean;
  canBookSession: boolean;
  canAcceptBooking: boolean;
  isAdmin: boolean;
  isModerator: boolean;
} {
  return {
    canCreateListing: canCreateListing(user),
    canCreateProject: canCreateProject(user),
    canBookSession: canBookSession(user),
    canAcceptBooking: canAcceptBooking(user),
    isAdmin: isAdmin(user),
    isModerator: isModerator(user),
  };
}
