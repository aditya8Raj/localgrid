'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access was denied. You may not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.';
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.';
      case 'Callback':
        return 'Error in the OAuth callback handler route.';
      case 'OAuthAccountNotLinked':
        return 'Email is already associated with another account.';
      case 'EmailSignin':
        return 'Sending the email with the verification token failed.';
      case 'CredentialsSignin':
        return 'Sign in with credentials failed. Check your credentials.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unexpected error occurred during sign in.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 text-center mb-6">
            {getErrorMessage(error)}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Error code: <code className="font-mono">{error}</code>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full px-4 py-3 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </Link>
            
            <Link
              href="/"
              className="block w-full px-4 py-3 bg-gray-100 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
