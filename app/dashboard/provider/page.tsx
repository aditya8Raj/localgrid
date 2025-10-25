import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Plus, Calendar, Star, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default async function ProviderDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.userType !== 'SKILL_PROVIDER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard/creator');
  }

  // Fetch provider's data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      listings: {
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          listings: { where: { isActive: true } },
          reviewsReceived: true,
        },
      },
    },
  });

  // Fetch bookings for the provider's listings
  const bookings = await prisma.booking.findMany({
    where: {
      listing: {
        ownerId: session.user.id,
      },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true, image: true },
      },
      listing: {
        select: { title: true },
      },
    },
  });

  // Calculate stats
  const totalListings = user?._count.listings || 0;
  const totalReviews = user?._count.reviewsReceived || 0;
  const credits = user?.credits || 0;

  // Calculate average rating
  const reviews = await prisma.review.findMany({
    where: { subjectId: session.user.id },
    select: { rating: true },
  });
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Provider Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {session.user.name || 'Provider'}!
              </p>
            </div>
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalListings}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{avgRating}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{totalReviews} reviews</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{credits}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Your Listings</h2>
            </div>
            <div className="p-6">
              {user?.listings && user.listings.length > 0 ? (
                <div className="space-y-4">
                  {user.listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{listing.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {listing.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {listing.durationMins} mins
                          </span>
                          {listing.priceCents && (
                            <span className="text-xs font-medium text-green-600">
                              ₹{(listing.priceCents / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No listings yet</p>
                  <Link
                    href="/listings/new"
                    className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first listing
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="p-6">
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {booking.listing.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {booking.user.name || booking.user.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(booking.startAt).toLocaleDateString('en-IN')}
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
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
