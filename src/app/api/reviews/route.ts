import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating reviews
const reviewSchema = z.object({
  subjectId: z.string().cuid(),
  listingId: z.string().cuid().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
})

/**
 * GET /api/reviews
 * Get reviews for a user or listing
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId') // User being reviewed
    const reviewerId = searchParams.get('reviewerId') // User who wrote review
    const listingId = searchParams.get('listingId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    type WhereClause = {
      subjectId?: string
      reviewerId?: string
      listingId?: string | null
    }

    const where: WhereClause = {}

    if (subjectId) {
      where.subjectId = subjectId
    }

    if (reviewerId) {
      where.reviewerId = reviewerId
    }

    if (listingId) {
      where.listingId = listingId
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where }),
    ])

    // Calculate average rating if subjectId provided
    let averageRating = null
    if (subjectId) {
      const ratingStats = await prisma.review.aggregate({
        where: { subjectId },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      })
      averageRating = {
        average: ratingStats._avg.rating || 0,
        count: ratingStats._count.rating,
      }
    }

    return NextResponse.json({
      reviews,
      total,
      limit,
      offset,
      averageRating,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = reviewSchema.parse(body)

    // Prevent self-review
    if (validatedData.subjectId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot review yourself' },
        { status: 400 }
      )
    }

    // Check if subject user exists
    const subjectUser = await prisma.user.findUnique({
      where: { id: validatedData.subjectId },
    })

    if (!subjectUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If listing provided, verify it exists
    if (validatedData.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: validatedData.listingId },
      })

      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }

      // Verify the listing belongs to the subject
      if (listing.ownerId !== validatedData.subjectId) {
        return NextResponse.json(
          { error: 'Listing does not belong to the user being reviewed' },
          { status: 400 }
        )
      }

      // Check if there's a completed booking between reviewer and this listing
      const completedBooking = await prisma.booking.findFirst({
        where: {
          userId: session.user.id,
          listingId: validatedData.listingId,
          status: 'COMPLETED',
        },
      })

      if (!completedBooking) {
        return NextResponse.json(
          { error: 'You can only review after completing a booking' },
          { status: 403 }
        )
      }

      // Check if review already exists for this booking/listing
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewerId: session.user.id,
          listingId: validatedData.listingId,
          subjectId: validatedData.subjectId,
        },
      })

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this listing' },
          { status: 400 }
        )
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        subjectId: validatedData.subjectId,
        listingId: validatedData.listingId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(
      { message: 'Review created successfully', review },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reviews
 * Delete a review (only by reviewer or admin)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    // Check permissions - only reviewer or admin can delete
    if (existingReview.reviewerId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this review' },
        { status: 403 }
      )
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Review deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
