'use client';

import { useAuth } from '@/lib/firebase-auth-context';
import { useRouter } from 'next/navigation';
import { Users, Edit, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProjectActionsProps {
  projectId: string;
  ownerId: string;
  isMember?: boolean;
}

export function ProjectActions({ projectId, ownerId, isMember = false }: ProjectActionsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinProject = async () => {
    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join project');
        return;
      }

      // Success - refresh the page to show updated membership
      alert(data.message || 'Successfully joined project!');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Join project error:', err);
    } finally {
      setIsJoining(false);
    }
  };

  // If not logged in, show sign-in prompt
  if (!user) {
    return (
      <div className="mt-8 border-t pt-8" role="region" aria-label="Project actions">
        <button 
          onClick={() => router.push('/auth/signin')}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          aria-label="Sign in to join this project"
        >
          Sign in to join this project
        </button>
      </div>
    );
  }

  // If user is the owner, show edit button
  if (user.id === ownerId) {
    return (
      <div className="mt-8 border-t pt-8" role="region" aria-label="Project actions">
        <div className="flex gap-4">
          <button 
            onClick={() => router.push(`/projects/${projectId}/edit`)}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            aria-label="Edit project details"
          >
            <Edit className="w-5 h-5" aria-hidden="true" />
            <span>Edit Project</span>
          </button>
        </div>
      </div>
    );
  }

  // If user is a SKILL_PROVIDER, show join button or member badge
  if (user.userType === 'SKILL_PROVIDER') {
    // If already a member, show badge
    if (isMember) {
      return (
        <div className="mt-8 border-t pt-8" role="region" aria-label="Project membership status">
          <div className="bg-green-50 border border-green-200 text-green-700 py-4 px-6 rounded-lg text-center flex items-center justify-center gap-2" role="status" aria-live="polite">
            <Users className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">You are a member of this project</span>
          </div>
        </div>
      );
    }

    // Show join button
    return (
      <div className="mt-8 border-t pt-8" role="region" aria-label="Project actions">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert" aria-live="polite">
            {error}
          </div>
        )}
        <div className="flex gap-4">
          <button 
            onClick={handleJoinProject}
            disabled={isJoining}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isJoining ? 'Joining project...' : 'Join this project as a member'}
            aria-disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" aria-hidden="true" />
                <span>Join Project</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // If user is a PROJECT_CREATOR (not owner), show message
  return (
    <div className="mt-8 border-t pt-8" role="region" aria-label="Project access information">
      <div className="bg-gray-100 text-gray-700 py-4 px-6 rounded-lg text-center" role="status">
        Only skill providers can join projects. You can create your own project from your dashboard.
      </div>
    </div>
  );
}
