import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MapPin, Clock, DollarSign, Star } from 'lucide-react';
import Image from 'next/image';
import { ListingActions } from '@/components/ListingActions';
import { ReviewDisplay } from '@/components/ReviewDisplay';

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
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
        include: {
          reviewer: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!listing || !listing.isActive) {
    return null;
  }

  return listing;
}

export default async function ListingDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const avgRating = listing.reviews.length > 0
    ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
                
                {/* Provider Info */}
                <div className="flex items-center gap-4 mb-6">
                  {listing.owner.image && (
                    <Image
                      src={listing.owner.image}
                      alt={listing.owner.name || 'Provider'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{listing.owner.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {listing.owner.locationCity && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.owner.locationCity}
                        </span>
                      )}
                      {listing.reviews.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {avgRating.toFixed(1)} ({listing.reviews.length} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {listing.skillTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Duration */}
              <div className="ml-8 text-right">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {listing.priceCents && listing.priceCents > 0 ? (
                    <>
                      <DollarSign className="inline w-6 h-6" />
                      {(listing.priceCents / 100).toFixed(0)}
                    </>
                  ) : (
                    'Free/Barter'
                  )}
                </div>
                <div className="text-gray-600 flex items-center justify-end gap-1">
                  <Clock className="w-4 h-4" />
                  {listing.durationMins} mins
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this session</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Action Buttons */}
            <ListingActions listingId={listing.id} ownerId={listing.ownerId} />
          </div>
        </div>

        {/* Reviews */}
        {listing.reviews.length > 0 ? (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
            <ReviewDisplay 
              reviews={listing.reviews}
              averageRating={avgRating}
              totalReviews={listing.reviews.length}
            />
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
            <p className="text-gray-600">No reviews yet. Book a session and be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
