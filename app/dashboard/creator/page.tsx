import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Plus, Calendar, Search, Briefcase, DollarSign, Users, Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CreditWallet } from '@/components/CreditWallet';

export default async function CreatorDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.userType !== 'PROJECT_CREATOR' && session.user.role !== 'ADMIN') {
    redirect('/dashboard/provider');
  }

  // Fetch creator's data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bookings: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              owner: {
                select: { name: true, email: true, image: true },
              },
            },
          },
        },
      },
      projectsOwned: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { members: true },
          },
        },
      },
      _count: {
        select: {
          bookings: true,
          projectsOwned: true,
        },
      },
    },
  });

  const totalBookings = user?._count.bookings || 0;
  const totalProjects = user?._count.projectsOwned || 0;
  const credits = user?.credits || 0;

  // Calculate total spending
  const totalSpending = user?.bookings.reduce((sum, booking) => {
    return sum + (booking.priceCents || 0);
  }, 0) || 0;

  // Fetch recommended providers (nearby active listings)
  const recommendedListings = await prisma.listing.findMany({
    where: {
      isActive: true,
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
          locationCity: true,
        },
      },
      reviews: {
        select: {
          rating: true,
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
                Creator Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {session.user.name || 'Creator'}!
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                Find Providers
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Project
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalBookings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalProjects}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{(totalSpending / 100).toFixed(0)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <CreditWallet balance={credits} />
          </div>
        </div>

        {/* Recommended Providers */}
        {recommendedListings.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recommended Providers</h2>
              <Link href="/listings" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedListings.map((listing) => {
                  const avgRating = listing.reviews.length > 0
                    ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
                    : 0;
                  
                  return (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="block border rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {listing.owner.image ? (
                          <Image
                            src={listing.owner.image}
                            alt={listing.owner.name || 'Provider'}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {listing.owner.name?.charAt(0) || 'P'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {listing.owner.name}
                          </p>
                          {listing.owner.locationCity && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {listing.owner.locationCity}
                            </p>
                          )}
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs">
                        {avgRating > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            {avgRating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-gray-600">{listing.durationMins}min</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Your Bookings</h2>
            </div>
            <div className="p-6">
              {user?.bookings && user.bookings.length > 0 ? (
                <div className="space-y-4">
                  {user.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {booking.listing.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Provider: {booking.listing.owner.name || booking.listing.owner.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(booking.startAt).toLocaleDateString('en-IN')} at {new Date(booking.startAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {booking.priceCents && booking.priceCents > 0 && (
                              <span className="text-xs font-medium text-green-600">
                                ₹{(booking.priceCents / 100).toFixed(2)}
                              </span>
                            )}
                            {booking.creditsUsed && (
                              <span className="text-xs font-medium text-indigo-600">
                                {booking.creditsUsed} credits
                              </span>
                            )}
                          </div>
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
                      <div className="flex gap-2">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </Link>
                        {booking.status === 'COMPLETED' && (
                          <Link
                            href={`/listings/${booking.listingId}?review=true`}
                            className="text-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                          >
                            Write Review
                          </Link>
                        )}
                        {booking.status === 'PENDING' && (
                          <button className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {user._count.bookings > 5 && (
                    <Link
                      href="/bookings"
                      className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-4"
                    >
                      View all bookings →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings yet</p>
                  <Link
                    href="/listings"
                    className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Find skill providers
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Your Projects */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
            </div>
            <div className="p-6">
              {user?.projectsOwned && user.projectsOwned.length > 0 ? (
                <div className="space-y-4">
                  {user.projectsOwned.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project._count.members} members
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              project.status === 'ACTIVE'
                                ? 'text-green-600'
                                : project.status === 'COMPLETED'
                                ? 'text-blue-600'
                                : 'text-yellow-600'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No projects yet</p>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/listings"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center group"
            >
              <Search className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                Browse Providers
              </p>
            </Link>
            <Link
              href="/projects/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center group"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                Create Project
              </p>
            </Link>
            <Link
              href="/credits"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center group"
            >
              <DollarSign className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                Buy Credits
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
