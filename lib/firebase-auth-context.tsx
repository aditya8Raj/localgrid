'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  userType: 'SKILL_PROVIDER' | 'PROJECT_CREATOR' | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  // Fetch user data from our database
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const response = await fetch(`/api/auth/user?email=${encodeURIComponent(firebaseUser.email || '')}`);

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('[Auth] Setting up onAuthStateChanged listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] Auth state changed, user:', firebaseUser?.email || 'null');
      console.log('[Auth] isSigningIn flag:', isSigningIn);
      
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        console.log('[Auth] Fetching user data from database...');
        const userData = await fetchUserData(firebaseUser);
        console.log('[Auth] User data from database:', userData);
        setUser(userData);
        
        // Only auto-redirect if NOT in the middle of signing in
        // (signInWithGoogle will handle the redirect)
        if (!isSigningIn && userData) {
          console.log('[Auth] Not in signin flow, checking for redirect...');
          // If user has no userType, redirect to role selection
          if (!userData.userType && window.location.pathname !== '/auth/role-selection') {
            console.log('[Auth] No userType, redirecting to role selection');
            router.push('/auth/role-selection');
          }
        }
      } else {
        console.log('[Auth] No Firebase user, clearing user data');
        setUser(null);
      }
      
      setLoading(false);
      console.log('[Auth] Loading complete');
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener');
      unsubscribe();
    };
  }, [isSigningIn, router]);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    try {
      console.log('[Auth] Starting Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('[Auth] Firebase signin successful, user:', user.email);

      // Send user data to backend to create/update user in database
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          picture: user.photoURL,
        }),
      });

      console.log('[Auth] Signin API response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('[Auth] User data received:', userData);
        setUser(userData);

        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect based on userType
        if (!userData.userType) {
          console.log('[Auth] No userType, redirecting to role selection');
          window.location.href = '/auth/role-selection';
        } else {
          const dashboardUrl = userData.userType === 'SKILL_PROVIDER'
            ? '/dashboard/provider'
            : '/dashboard/creator';
          console.log('[Auth] Redirecting to dashboard:', dashboardUrl);
          window.location.href = dashboardUrl;
        }
      } else {
        const errorData = await response.json();
        console.error('[Auth] Signin API error:', errorData);
        throw new Error(errorData.error || 'Failed to sign in');
      }
    } catch (error) {
      console.error('[Auth] Error signing in with Google:', error);
      setIsSigningIn(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await fetchUserData(firebaseUser);
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
