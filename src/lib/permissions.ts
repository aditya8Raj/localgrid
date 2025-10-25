import { Session } from "next-auth";

export type UserType = 'SKILL_PROVIDER' | 'PROJECT_CREATOR';
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

/**
 * Permission checking utilities for role-based access control
 */

// Skill Provider Permissions
export function canCreateListing(session: Session | null): boolean {
  return session?.user?.userType === 'SKILL_PROVIDER';
}

export function canManageBookings(session: Session | null): boolean {
  return session?.user?.userType === 'SKILL_PROVIDER';
}

export function canEarnCredits(session: Session | null): boolean {
  return session?.user?.userType === 'SKILL_PROVIDER';
}

// Project Creator Permissions
export function canCreateProject(session: Session | null): boolean {
  return session?.user?.userType === 'PROJECT_CREATOR';
}

export function canPostOpportunity(session: Session | null): boolean {
  return session?.user?.userType === 'PROJECT_CREATOR';
}

export function canHireProviders(session: Session | null): boolean {
  return session?.user?.userType === 'PROJECT_CREATOR';
}

// Shared Permissions
export function canBrowseListings(session: Session | null): boolean {
  return !!session?.user; // All authenticated users can browse
}

export function canViewProjects(session: Session | null): boolean {
  return !!session?.user; // All authenticated users can view
}

export function canJoinProject(session: Session | null): boolean {
  // Both types can join projects as members
  return !!session?.user;
}

export function canLeaveReview(session: Session | null): boolean {
  return !!session?.user;
}

export function canSendMessages(session: Session | null): boolean {
  return !!session?.user;
}

// Admin Permissions
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'ADMIN';
}

export function isModerator(session: Session | null): boolean {
  return session?.user?.role === 'MODERATOR' || session?.user?.role === 'ADMIN';
}

export function canVerifyUsers(session: Session | null): boolean {
  return isAdmin(session);
}

export function canManageReports(session: Session | null): boolean {
  return isModerator(session);
}

export function canBanUsers(session: Session | null): boolean {
  return isAdmin(session);
}

export function canApproveBadges(session: Session | null): boolean {
  return isAdmin(session);
}

export function canViewAdminDashboard(session: Session | null): boolean {
  return isModerator(session);
}

export function canAccessAdminLogs(session: Session | null): boolean {
  return isAdmin(session);
}

// Resource Ownership Checks
export function canEditListing(session: Session | null, ownerId: string): boolean {
  if (!session?.user) return false;
  if (isAdmin(session)) return true;
  return session.user.id === ownerId && canCreateListing(session);
}

export function canEditProject(session: Session | null, ownerId: string): boolean {
  if (!session?.user) return false;
  if (isAdmin(session)) return true;
  return session.user.id === ownerId && canCreateProject(session);
}

export function canDeleteReview(session: Session | null, reviewerId: string): boolean {
  if (!session?.user) return false;
  if (isModerator(session)) return true;
  return session.user.id === reviewerId;
}

// Dashboard Access
export function getDefaultDashboard(userType: UserType | undefined): string {
  switch (userType) {
    case 'SKILL_PROVIDER':
      return '/dashboard/provider';
    case 'PROJECT_CREATOR':
      return '/dashboard/creator';
    default:
      return '/dashboard';
  }
}

export function canAccessProviderDashboard(session: Session | null): boolean {
  if (!session?.user) return false;
  return session.user.userType === 'SKILL_PROVIDER' || isAdmin(session);
}

export function canAccessCreatorDashboard(session: Session | null): boolean {
  if (!session?.user) return false;
  return session.user.userType === 'PROJECT_CREATOR' || isAdmin(session);
}

// Verification Status
export function requiresVerification(action: string): boolean {
  const verifiedActions = [
    'create_paid_listing',
    'withdraw_credits',
    'post_project_with_budget',
  ];
  return verifiedActions.includes(action);
}

export function isVerified(session: Session | null): boolean {
  return session?.user?.isVerified === true;
}

export function canPerformVerifiedAction(session: Session | null, action: string): boolean {
  if (!requiresVerification(action)) return true;
  return isVerified(session);
}

// Helper to get permission error message
export function getPermissionErrorMessage(requiredPermission: string): string {
  const messages: Record<string, string> = {
    canCreateListing: 'Only Skill Providers can create listings',
    canCreateProject: 'Only Project Creators can create projects',
    canVerifyUsers: 'Admin access required',
    canManageReports: 'Moderator access required',
    isVerified: 'Your account must be verified to perform this action',
  };
  
  return messages[requiredPermission] || 'You do not have permission to perform this action';
}
