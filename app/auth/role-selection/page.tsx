'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Briefcase, Palette } from 'lucide-react';

function RoleSelectionContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [selectedRole, setSelectedRole] = useState<'SKILL_PROVIDER' | 'PROJECT_CREATOR' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userType: selectedRole,
          userId: userId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save role');
      }

      // Role saved successfully!
      // Determine the callback URL based on role
      const dashboardUrl = selectedRole === 'SKILL_PROVIDER' 
        ? '/dashboard/provider' 
        : '/dashboard/creator';
      
      // Redirect to dashboard - session will be updated on next request
      window.location.href = dashboardUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to LocalGrid! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Choose your role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Skill Provider Card */}
          <button
            onClick={() => setSelectedRole('SKILL_PROVIDER')}
            disabled={isLoading}
            className={`relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedRole === 'SKILL_PROVIDER'
                ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-lg ${
                selectedRole === 'SKILL_PROVIDER' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Palette className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Skill Provider 🎨
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  I want to offer my skills and services
                </p>
              </div>
            </div>
            
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Create and manage skill listings</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Accept bookings from project creators</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Earn credits through services</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Build reputation with reviews</span>
              </li>
            </ul>

            {selectedRole === 'SKILL_PROVIDER' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* Project Creator Card */}
          <button
            onClick={() => setSelectedRole('PROJECT_CREATOR')}
            disabled={isLoading}
            className={`relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedRole === 'PROJECT_CREATOR'
                ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-lg ${
                selectedRole === 'PROJECT_CREATOR' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Project Creator 💼
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  I need services and want to hire talent
                </p>
              </div>
            </div>
            
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Browse and search skill providers</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Book sessions with providers</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Create community projects</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm">Review and rate providers</span>
              </li>
            </ul>

            {selectedRole === 'PROJECT_CREATOR' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              selectedRole && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Saving...' : 'Continue to Dashboard →'}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Don&apos;t worry, you can always reach out to support if you need to change your role later
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <RoleSelectionContent />
    </Suspense>
  );
}
