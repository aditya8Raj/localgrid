import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Plus, Calendar, Star, Users, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProviderBookingCard } from '@/components/ProviderBookingCard';
import { CreditWallet } from '@/components/CreditWallet';

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

  // Fetch available community projects
  const availableProjects = await prisma.communityProject.findMany({
    where: {
      status: 'ACTIVE',
    },
    take: 4,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

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
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <CreditWallet balance={credits} />
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
                        href={`/listings/${listing.id}/edit`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Edit
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
                    <ProviderBookingCard key={booking.id} booking={booking} />
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

        {/* Available Community Projects */}
        {availableProjects.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Community Projects</h2>
              <p className="text-sm text-gray-600">Join projects to collaborate with creators</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block border rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {project.owner.image ? (
                        <Image
                          src={project.owner.image}
                          alt={project.owner.name || 'Owner'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {project.owner.name}
                        </p>
                        <p className="text-xs text-gray-500">Project Owner</p>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Users className="w-3 h-3" />
                        {project._count.members} members
                      </span>
                      <span className="text-green-600 font-medium">{project.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Join projects to build your portfolio and earn community recognition
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
