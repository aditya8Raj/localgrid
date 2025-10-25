import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MapPin, Search, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  const session = await auth();

  console.log('[HomePage] Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userType: session?.user?.userType || 'null',
    email: session?.user?.email || 'no-email'
  });

  // If user is authenticated but hasn't selected role, redirect to role selection
  if (session?.user && !session.user.userType) {
    console.log('[HomePage] Redirecting to role-selection (no userType)');
    redirect('/auth/role-selection');
  }

  // Redirect authenticated users to their dashboard
  if (session?.user?.userType) {
    const dashboardUrl = session.user.userType === 'SKILL_PROVIDER' 
      ? '/dashboard/provider' 
      : '/dashboard/creator';
    console.log('[HomePage] Redirecting to dashboard:', dashboardUrl);
    redirect(dashboardUrl);
  }

  // Fetch some sample listings for the home page
  const listings = await prisma.listing.findMany({
    where: { isActive: true },
    take: 12,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: {
          name: true,
          image: true,
          locationCity: true,
        },
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  // Calculate average ratings
  const listingsWithRatings = await Promise.all(
    listings.map(async (listing) => {
      const reviews = await prisma.review.findMany({
        where: { listingId: listing.id },
        select: { rating: true },
      });
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      return { ...listing, avgRating, reviewCount: reviews.length };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to LocalGrid
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              India&apos;s hyperlocal skill exchange platform. Connect with talented providers in your area or offer your skills to the community.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="#browse"
                className="px-8 py-4 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-400 transition-colors"
              >
                Browse Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section id="browse" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Skill Providers</h2>
            <p className="text-gray-600 mt-2">Discover talented professionals in your area</p>
          </div>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            Search All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listingsWithRatings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.skillTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {listing.skillTags.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      +{listing.skillTags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {listing.owner.image ? (
                      <Image
                        src={listing.owner.image}
                        alt={listing.owner.name || 'Provider'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {listing.owner.name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {listing.owner.name || 'Anonymous'}
                      </p>
                      {listing.owner.locationCity && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.owner.locationCity}
                        </p>
                      )}
                    </div>
                  </div>

                  {listing.avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {listing.avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({listing.reviewCount})
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {listing.priceCents ? (
                    <span className="text-lg font-bold text-green-600">
                      ₹{(listing.priceCents / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Credits based</span>
                  )}
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No listings available yet. Be the first to create one!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of skill providers and project creators on LocalGrid. Sign in with Google to get started in seconds.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Sign In with Google
          </Link>
        </div>
      </section>
    </div>
  );
}
