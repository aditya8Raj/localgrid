import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendBookingConfirmationEmail, sendBookingConfirmedEmail, sendBookingCancelledEmail } from '@/services/email'
import { scheduleBookingReminders, cancelBookingReminders } from '@/services/jobs'

// Validation schema for creating bookings
const bookingSchema = z.object({
  listingId: z.string().cuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  priceCents: z.number().int().nonnegative().optional().nullable(),
  creditsUsed: z.number().int().nonnegative().optional().nullable(),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  { message: 'End time must be after start time' }
)

/**
 * Check for booking conflicts
 */
async function checkBookingConflict(
  listingId: string,
  startAt: Date,
  endAt: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      listingId,
      status: 'CONFIRMED',
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        {
          // New booking starts during existing booking
          AND: [
            { startAt: { lte: startAt } },
            { endAt: { gt: startAt } },
          ],
        },
        {
          // New booking ends during existing booking
          AND: [
            { startAt: { lt: endAt } },
            { endAt: { gte: endAt } },
          ],
        },
        {
          // New booking completely contains existing booking
          AND: [
            { startAt: { gte: startAt } },
            { endAt: { lte: endAt } },
          ],
        },
      ],
    },
  })

  return !!conflictingBooking
}

/**
 * GET /api/bookings
 * Get user's bookings
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    const listingId = searchParams.get('listingId')
    const asProvider = searchParams.get('asProvider') === 'true'

    // Build where clause with proper types
    type WhereClause = {
      userId?: string
      listing?: { ownerId: string }
      status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DECLINED'
      listingId?: string
    }

    const where: WhereClause = {
      userId: asProvider ? undefined : session.user.id,
    }

    // If asProvider=true, get bookings where user is the listing owner
    if (asProvider) {
      where.listing = {
        ownerId: session.user.id,
      }
    }

    if (statusParam && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'DECLINED'].includes(statusParam)) {
      where.status = statusParam as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DECLINED'
    }

    if (listingId) {
      where.listingId = listingId
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: {
        startAt: 'desc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookings
 * Create a new booking
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
    const validatedData = bookingSchema.parse(body)

    const startAt = new Date(validatedData.startAt)
    const endAt = new Date(validatedData.endAt)

    // Check if listing exists and is active
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (!listing.isActive) {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const hasConflict = await checkBookingConflict(
      validatedData.listingId,
      startAt,
      endAt
    )

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        listingId: validatedData.listingId,
        startAt,
        endAt,
        priceCents: validatedData.priceCents,
        creditsUsed: validatedData.creditsUsed,
        status: 'PENDING',
      },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    })

    // Send booking confirmation email (async, don't block response)
    sendBookingConfirmationEmail(booking.user.email!, {
      userName: booking.user.name || 'there',
      listingTitle: booking.listing.title,
      providerName: booking.listing.owner.name || 'the provider',
      startTime: booking.startAt.toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }),
      endTime: booking.endAt.toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }),
      duration: booking.listing.durationMins,
      price: booking.priceCents ? booking.priceCents / 100 : undefined,
      bookingId: booking.id,
    }).catch(err => {
      console.error('Failed to send booking confirmation email:', err)
    })

    return NextResponse.json(
      { message: 'Booking created successfully', booking },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/bookings
 * Update booking status (confirm/cancel/complete)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'DECLINED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwner = existingBooking.listing.ownerId === session.user.id
    const isBooker = existingBooking.userId === session.user.id

    if (!isOwner && !isBooker) {
      return NextResponse.json(
        { error: 'You do not have permission to update this booking' },
        { status: 403 }
      )
    }

    // Business rules for status updates
    if (status === 'CONFIRMED' && !isOwner) {
      return NextResponse.json(
        { error: 'Only the listing owner can confirm bookings' },
        { status: 403 }
      )
    }

    if (status === 'COMPLETED') {
      if (!isOwner && !isBooker) {
        return NextResponse.json(
          { error: 'Only the listing owner or booker can mark as completed' },
          { status: 403 }
        )
      }

      // Check if booking time has passed
      if (new Date() < existingBooking.endAt) {
        return NextResponse.json(
          { error: 'Cannot complete booking before end time' },
          { status: 400 }
        )
      }
    }

    // If confirming, check for conflicts again
    if (status === 'CONFIRMED') {
      const hasConflict = await checkBookingConflict(
        existingBooking.listingId,
        existingBooking.startAt,
        existingBooking.endAt,
        id
      )

      if (hasConflict) {
        return NextResponse.json(
          { error: 'Time slot conflict detected' },
          { status: 409 }
        )
      }
    }

    // Handle credit transactions when completing
    if (status === 'COMPLETED' && existingBooking.creditsUsed && existingBooking.creditsUsed > 0) {
      // Deduct credits from booker and add to listing owner
      await prisma.$transaction([
        // Deduct from booker
        prisma.user.update({
          where: { id: existingBooking.userId },
          data: {
            credits: {
              decrement: existingBooking.creditsUsed,
            },
          },
        }),
        // Add to owner
        prisma.user.update({
          where: { id: existingBooking.listing.ownerId },
          data: {
            credits: {
              increment: existingBooking.creditsUsed,
            },
          },
        }),
        // Record transactions
        prisma.creditTransaction.create({
          data: {
            userId: existingBooking.userId,
            amount: -existingBooking.creditsUsed,
            reason: `Booking completed: ${existingBooking.listing.title}`,
          },
        }),
        prisma.creditTransaction.create({
          data: {
            userId: existingBooking.listing.ownerId,
            amount: existingBooking.creditsUsed,
            reason: `Booking payment received: ${existingBooking.listing.title}`,
          },
        }),
      ])
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    })

    // Send appropriate email based on status change
    const emailPromises: Promise<unknown>[] = []

    if (status === 'CONFIRMED') {
      // Send confirmation email to booker
      emailPromises.push(
        sendBookingConfirmedEmail(updatedBooking.user.email!, {
          userName: updatedBooking.user.name || 'there',
          listingTitle: updatedBooking.listing.title,
          providerName: updatedBooking.listing.owner.name || 'the provider',
          startTime: updatedBooking.startAt.toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
          }),
          endTime: updatedBooking.endAt.toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
          }),
          duration: updatedBooking.listing.durationMins,
          price: updatedBooking.priceCents ? updatedBooking.priceCents / 100 : undefined,
        })
      )

      // Schedule reminder emails
      scheduleBookingReminders(updatedBooking.id, updatedBooking.startAt).catch(err => {
        console.error('Failed to schedule booking reminders:', err)
      })
    }

    if (status === 'CANCELLED' || status === 'DECLINED') {
      // Send cancellation email to booker
      emailPromises.push(
        sendBookingCancelledEmail(updatedBooking.user.email!, {
          userName: updatedBooking.user.name || 'there',
          listingTitle: updatedBooking.listing.title,
          providerName: updatedBooking.listing.owner.name || 'the provider',
        })
      )

      // Cancel any scheduled reminders
      cancelBookingReminders(updatedBooking.id).catch(err => {
        console.error('Failed to cancel booking reminders:', err)
      })
    }

    // Execute email sends asynchronously (don't block response)
    Promise.all(emailPromises).catch(err => {
      console.error('Failed to send status change emails:', err)
    })

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
