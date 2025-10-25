import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  skillTags: z.array(z.string()).min(1).max(10),
  priceCents: z.number().int().min(0),
  durationMins: z.number().int().min(15).max(480),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  locationCity: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only SKILL_PROVIDER users can create listings
    if (session.user.userType !== 'SKILL_PROVIDER') {
      return NextResponse.json(
        { error: 'Only skill providers can create listings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createListingSchema.parse(body);

    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        skillTags: validatedData.skillTags,
        priceCents: validatedData.priceCents,
        durationMins: validatedData.durationMins,
        lat: validatedData.lat,
        lng: validatedData.lng,
        ownerId: user.id,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
      },
    });
  } catch (error) {
    console.error('Create listing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid listing data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// GET /api/listings - Browse/search listings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50'; // Default 50km
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    // Base query
    let listings;

    if (lat && lng) {
      // Geo-search with Haversine distance
      const radiusKm = parseFloat(radius);
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      listings = await prisma.$queryRaw`
        SELECT 
          l.*,
          (6371 * 2 * asin(sqrt(
            pow(sin(radians(${userLat} - lat) / 2), 2) +
            cos(radians(${userLat})) * cos(radians(lat)) *
            pow(sin(radians(${userLng} - lng) / 2), 2)
          ))) AS distance_km
        FROM "Listing" l
        WHERE l."isActive" = true
        HAVING distance_km <= ${radiusKm}
        ORDER BY distance_km ASC
        LIMIT 50
      `;
    } else {
      // Regular search without geo-filtering
      listings = await prisma.listing.findMany({
        where: {
          isActive: true,
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
          ...(tags && tags.length > 0 && {
            skillTags: {
              hasSome: tags,
            },
          }),
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: 50,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Calculate average ratings
    const listingsWithRatings = Array.isArray(listings) ? listings.map((listing: { reviews?: { rating: number }[]; [key: string]: unknown }) => {
      const avgRating = listing.reviews && listing.reviews.length > 0
        ? listing.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / listing.reviews.length
        : 0;

      return {
        ...listing,
        avgRating,
        reviewCount: listing.reviews?.length || 0,
      };
    }) : [];

    return NextResponse.json({
      listings: listingsWithRatings,
    });
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
