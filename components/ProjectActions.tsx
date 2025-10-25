'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Edit } from 'lucide-react';

interface ProjectActionsProps {
  projectId: string;
  ownerId: string;
}

export function ProjectActions({ projectId, ownerId }: ProjectActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // If not logged in, show sign-in prompt
  if (!session) {
    return (
      <div className="mt-8 border-t pt-8">
        <button 
          onClick={() => router.push('/auth/signin')}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Sign in to join this project
        </button>
      </div>
    );
  }

  // If user is the owner, show edit button
  if (session.user.id === ownerId) {
    return (
      <div className="mt-8 border-t pt-8">
        <div className="flex gap-4">
          <button 
            onClick={() => router.push(`/projects/${projectId}/edit`)}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Project
          </button>
        </div>
      </div>
    );
  }

  // If user is a SKILL_PROVIDER, show join button
  if (session.user.userType === 'SKILL_PROVIDER') {
    return (
      <div className="mt-8 border-t pt-8">
        <div className="flex gap-4">
          <button 
            onClick={() => {
              // TODO: Implement join project functionality
              alert('Join project functionality will be implemented soon!');
            }}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Join Project
          </button>
        </div>
      </div>
    );
  }

  // If user is a PROJECT_CREATOR (not owner), show message
  return (
    <div className="mt-8 border-t pt-8">
      <div className="bg-gray-100 text-gray-700 py-4 px-6 rounded-lg text-center">
        Only skill providers can join projects. You can create your own project from your dashboard.
      </div>
    </div>
  );
}
