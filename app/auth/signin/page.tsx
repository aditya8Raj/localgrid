'use client';'use client';



import { useAuth } from '@/lib/firebase-auth-context';import { signIn } from 'next-auth/react';

import { useState } from 'react';import { useState, Suspense } from 'react';

import { useRouter } from 'next/navigation';import { useSearchParams } from 'next/navigation';



export default function SignInPage() {function SignInContent() {

  const { signInWithGoogle, loading } = useAuth();  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);  const searchParams = useSearchParams();

  const [signingIn, setSigningIn] = useState(false);  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const error = searchParams.get('error');

  const handleGoogleSignIn = async () => {

    setSigningIn(true);  const handleGoogleSignIn = async () => {

    setError(null);    setIsLoading(true);

    try {

    try {      await signIn('google', { callbackUrl });

      await signInWithGoogle();    } catch (error) {

    } catch (err) {      console.error('Sign in error:', error);

      console.error('Sign in error:', err);      setIsLoading(false);

      setError('Failed to sign in. Please try again.');    }

      setSigningIn(false);  };

    }

  };  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

  if (loading) {      <div className="max-w-md w-full space-y-8">

    return (        <div className="text-center">

      <div className="min-h-screen flex items-center justify-center">          <h1 className="text-4xl font-bold text-gray-900 mb-2">

        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>            Welcome to LocalGrid

      </div>          </h1>

    );          <p className="text-lg text-gray-600">

  }            India&apos;s hyperlocal skill exchange platform

          </p>

  return (        </div>

    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="max-w-md w-full">        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">

        <div className="text-center mb-8">          <div className="space-y-6">

          <h1 className="text-4xl font-bold text-gray-900 mb-2">            {error && (

            Welcome to LocalGrid              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">

          </h1>                <p className="text-sm text-red-700">

          <p className="text-gray-600">                  {error === 'OAuthAccountNotLinked'

            Sign in to connect with local skill providers                    ? 'This email is already registered with a different sign-in method.'

          </p>                    : 'An error occurred during sign in. Please try again.'}

        </div>                </p>

              </div>

        <div className="bg-white rounded-lg shadow-md p-8">            )}

          {error && (

            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">            <div>

              {error}              <button

            </div>                onClick={handleGoogleSignIn}

          )}                disabled={isLoading}

                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

          <button              >

            onClick={handleGoogleSignIn}                {isLoading ? (

            disabled={signingIn}                  <>

            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"                    <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

          >                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

            {signingIn ? (                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>                    </svg>

            ) : (                    <span>Signing in...</span>

              <>                  </>

                <svg className="w-5 h-5" viewBox="0 0 24 24">                ) : (

                  <path                  <>

                    fill="#4285F4"                    <svg className="w-5 h-5" viewBox="0 0 24 24">

                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"                      <path

                  />                        fill="currentColor"

                  <path                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"

                    fill="#34A853"                      />

                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"                      <path

                  />                        fill="currentColor"

                  <path                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"

                    fill="#FBBC05"                      />

                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"                      <path

                  />                        fill="currentColor"

                  <path                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"

                    fill="#EA4335"                      />

                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"                      <path

                  />                        fill="currentColor"

                </svg>                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"

                <span className="text-gray-700 font-medium">                      />

                  Sign in with Google                    </svg>

                </span>                    <span>Continue with Google</span>

              </>                  </>

            )}                )}

          </button>              </button>

            </div>

          <p className="mt-6 text-xs text-center text-gray-500">

            By signing in, you agree to our Terms of Service and Privacy Policy            <div className="relative">

          </p>              <div className="absolute inset-0 flex items-center">

        </div>                <div className="w-full border-t border-gray-300"></div>

      </div>              </div>

    </div>              <div className="relative flex justify-center text-sm">

  );                <span className="px-2 bg-white text-gray-500">

}                  Secure sign in with your Google account

                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            First time here? Sign in with Google and we&apos;ll help you set up your account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
