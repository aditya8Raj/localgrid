'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProviderBookingCardProps {
  booking: {
    id: string;
    startAt: Date;
    status: string;
    listing: {
      title: string;
    };
    user: {
      name: string | null;
      email: string;
    };
  };
}

export function ProviderBookingCard({ booking }: ProviderBookingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!confirm('Confirm this booking?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to confirm booking');
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to confirm booking');
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Decline this booking? This action cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/decline`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to decline booking');
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to decline booking');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {booking.listing.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {booking.user.name || booking.user.email}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(booking.startAt).toLocaleDateString('en-IN')} at{' '}
            {new Date(booking.startAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            booking.status === 'CONFIRMED'
              ? 'bg-green-100 text-green-700'
              : booking.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-700'
              : booking.status === 'COMPLETED'
              ? 'bg-blue-100 text-blue-700'
              : booking.status === 'DECLINED'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <Link
          href={`/bookings/${booking.id}`}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          View Details
        </Link>
        
        {booking.status === 'PENDING' && (
          <>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Confirm'}
            </button>
            <button
              onClick={handleDecline}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Decline'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
