'use client';

import { useAuth } from '@/lib/firebase-auth-context';
import { useRouter } from 'next/navigation';
import { Calendar, Edit } from 'lucide-react';

interface ListingActionsProps {
  listingId: string;
  ownerId: string;
}

export function ListingActions({ listingId, ownerId }: ListingActionsProps) {
  const { user } = useAuth();
  const router = useRouter();

  // If not logged in, show sign-in prompt
  if (!user) {
    return (
      <div className="mt-8 border-t pt-8" role="region" aria-label="Listing actions">
        <button 
          onClick={() => router.push('/auth/signin')}
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors"
          aria-label="Sign in to book this session"
        >
          Sign in to book this session
        </button>
      </div>
    );
  }

  // If user is the owner, show edit button
  if (user.id === ownerId) {
    return (
      <div className="mt-8 border-t pt-8" role="region" aria-label="Listing actions">
        <button 
          onClick={() => router.push(`/listings/${listingId}/edit`)}
          className="w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          aria-label="Edit this listing"
        >
          <Edit className="w-5 h-5" aria-hidden="true" />
          <span>Edit Listing</span>
        </button>
      </div>
    );
  }

  // If user is a PROJECT_CREATOR, show book button
  if (user.userType === 'PROJECT_CREATOR') {
    return (
      <div className="mt-8 border-t pt-8" role="region" aria-label="Listing actions">
        <button 
          onClick={() => router.push(`/bookings/new?listingId=${listingId}`)}
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center gap-2"
          aria-label="Book this session and choose a time slot"
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
          <span>Book This Session</span>
        </button>
        <p className="mt-3 text-sm text-gray-500 text-center" aria-live="polite">
          You&apos;ll be able to choose a time slot in the next step
        </p>
      </div>
    );
  }

  // If user is a SKILL_PROVIDER (not owner), show message
  return (
    <div className="mt-8 border-t pt-8" role="region" aria-label="Booking restrictions">
      <div className="bg-gray-100 text-gray-700 py-4 px-6 rounded-lg text-center" role="status">
        Only project creators can book sessions. Switch to a creator account to book.
      </div>
    </div>
  );
}
