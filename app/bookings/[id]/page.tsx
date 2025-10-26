import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/server-auth';
import { Calendar, Clock, DollarSign, MapPin, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReviewForm } from '@/components/ReviewForm';
import { BookingActions } from '@/components/BookingActions';

async function getBooking(id: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
      listing: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              locationCity: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  // Check if user is authorized to view this booking
  if (booking.userId !== userId && booking.listing.ownerId !== userId) {
    return null;
  }

  return booking;
}

async function getExistingReview(bookingId: string, userId: string, listingId: string, ownerId: string) {
  return await prisma.review.findFirst({
    where: {
      reviewerId: userId,
      listingId: listingId,
      subjectId: ownerId,
    },
  });
}

export default async function BookingDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const user = await getUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  const { id } = await params;
  const booking = await getBooking(id, user.id);

  if (!booking) {
    notFound();
  }

  const isCreator = booking.userId === user.id;

  // Check if review already exists (for COMPLETED bookings)
  const existingReview = booking.status === 'COMPLETED' && isCreator
    ? await getExistingReview(booking.id, user.id, booking.listingId, booking.listing.ownerId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Booking Details
                </h1>
                <p className="text-gray-600">
                  {isCreator ? 'Your booking with' : 'Booking from'} {isCreator ? booking.listing.owner.name : booking.user.name}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-700'
                    : booking.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : booking.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-700'
                    : booking.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {booking.status}
              </span>
            </div>

            {/* Listing Info */}
            <div className="border-t border-b py-6 my-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session</h2>
              <Link 
                href={`/listings/${booking.listing.id}`}
                className="block hover:bg-gray-50 p-4 rounded-lg transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-2">{booking.listing.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{booking.listing.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {booking.listing.skillTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </div>

            {/* Time & Date */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - {new Date(booking.endAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">{booking.listing.durationMins} minutes</p>
                </div>
              </div>

              {booking.listing.owner.locationCity && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{booking.listing.owner.locationCity}</p>
                  </div>
                </div>
              )}

              {(booking.priceCents || booking.creditsUsed) && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment</p>
                    {booking.priceCents && booking.priceCents > 0 && (
                      <p className="text-sm text-gray-600">
                        ₹{(booking.priceCents / 100).toFixed(2)}
                      </p>
                    )}
                    {booking.creditsUsed && (
                      <p className="text-sm text-gray-600">
                        {booking.creditsUsed} credits
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Provider/Creator Info */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isCreator ? 'Provider' : 'Booked By'}
              </h2>
              <div className="flex items-center gap-4">
                {(isCreator ? booking.listing.owner.image : booking.user.image) ? (
                  <Image
                    src={(isCreator ? booking.listing.owner.image : booking.user.image)!}
                    alt={(isCreator ? booking.listing.owner.name : booking.user.name) || 'User'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {isCreator ? booking.listing.owner.name : booking.user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isCreator ? booking.listing.owner.email : booking.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <BookingActions 
              bookingId={booking.id}
              status={booking.status}
              isCreator={isCreator}
              listingId={booking.listingId}
            />
          </div>
        </div>

        {/* Review Form - Show for COMPLETED bookings if creator hasn't reviewed yet */}
        {booking.status === 'COMPLETED' && isCreator && !existingReview && (
          <div className="mt-6">
            <ReviewForm bookingId={booking.id} />
          </div>
        )}

        {/* Show message if already reviewed */}
        {booking.status === 'COMPLETED' && isCreator && existingReview && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            <p className="font-medium">You have already reviewed this booking</p>
          </div>
        )}

        {/* Booking Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Booking Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID</span>
              <span className="text-gray-900 font-mono text-xs">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reminder Sent</span>
              <span className="text-gray-900">{booking.reminderSent ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
