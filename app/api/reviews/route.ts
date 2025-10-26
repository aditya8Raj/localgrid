import { NextResponse } from 'next/server';
import { getUser } from '@/lib/server-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const authUser = await getUser();

    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { id: true, userType: true },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the booking with listing and owner info
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        listing: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify the user is the booking creator (not the provider)
    if (booking.userId !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the booking creator can leave a review' },
        { status: 403 }
      );
    }

    // Verify booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: authUser.id,
        listingId: booking.listingId,
        subjectId: booking.listing.ownerId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        reviewerId: authUser.id,
        subjectId: booking.listing.ownerId,
        listingId: booking.listingId,
      },
      include: {
        reviewer: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewer: review.reviewer,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch reviews for a listing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId');

    if (!listingId && !userId) {
      return NextResponse.json(
        { error: 'listingId or userId required' },
        { status: 400 }
      );
    }

    const where: { listingId?: string; subjectId?: string } = {};
    if (listingId) where.listingId = listingId;
    if (userId) where.subjectId = userId;

    const reviews = await prisma.review.findMany({
      where,
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
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      stats: {
        total: reviews.length,
        averageRating: Number(avgRating.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
