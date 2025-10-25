'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BookingActionsProps {
  bookingId: string;
  status: string;
  isCreator: boolean;
  listingId: string;
}

export function BookingActions({ bookingId, status, isCreator, listingId }: BookingActionsProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to confirm booking');
        return;
      }

      alert('Booking confirmed successfully!');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Confirm booking error:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this booking?')) {
      return;
    }

    setIsDeclining(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to decline booking');
        return;
      }

      alert('Booking declined');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Decline booking error:', err);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      // TODO: Implement cancel booking API
      alert('Cancel booking functionality will be implemented');
      setError('Cancel functionality not yet implemented');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Cancel booking error:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {status === 'PENDING' && (
          <>
            {!isCreator && (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={isDeclining}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeclining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Declining...
                    </>
                  ) : (
                    'Decline'
                  )}
                </button>
              </>
            )}
            {isCreator && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </button>
            )}
          </>
        )}

        {status === 'COMPLETED' && isCreator && (
          <Link
            href={`/listings/${listingId}?review=true`}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
          >
            Write Review
          </Link>
        )}

        <Link
          href={isCreator ? '/dashboard/creator' : '/dashboard/provider'}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
