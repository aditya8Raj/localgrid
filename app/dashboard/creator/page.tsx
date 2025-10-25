import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Plus, Calendar, Search, Briefcase, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

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
                href="/"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Available Credits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{credits}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {booking.listing.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Provider: {booking.listing.owner.name || booking.listing.owner.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(booking.startAt).toLocaleDateString('en-IN')}
                            </span>
                            {booking.priceCents && (
                              <span className="text-xs font-medium text-green-600">
                                ₹{(booking.priceCents / 100).toFixed(2)}
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings yet</p>
                  <Link
                    href="/"
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
                        href={`/projects/${project.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View
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
              href="/"
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
