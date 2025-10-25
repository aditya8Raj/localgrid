import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createBookingSchema = z.object({
  listingId: z.string().cuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  paymentMethod: z.enum(['credits', 'cash']).optional().default('cash'),
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

    // Only PROJECT_CREATOR users can create bookings
    if (session.user.userType !== 'PROJECT_CREATOR') {
      return NextResponse.json(
        { error: 'Only project creators can book sessions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Get the user's ID and credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the listing to check if it exists and get pricing
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      select: {
        id: true,
        priceCents: true,
        durationMins: true,
        isActive: true,
        ownerId: true,
      },
    });

    if (!listing || !listing.isActive) {
      return NextResponse.json(
        { error: 'Listing not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user is trying to book their own listing
    if (listing.ownerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot book your own listing' },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const startAt = new Date(validatedData.startAt);
    const endAt = new Date(validatedData.endAt);

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        listingId: validatedData.listingId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            AND: [
              { startAt: { lte: startAt } },
              { endAt: { gt: startAt } },
            ],
          },
          {
            AND: [
              { startAt: { lt: endAt } },
              { endAt: { gte: endAt } },
            ],
          },
          {
            AND: [
              { startAt: { gte: startAt } },
              { endAt: { lte: endAt } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose a different time.' },
        { status: 409 }
      );
    }

    // Calculate credits required if paying with credits
    const creditsRequired = listing.priceCents ? Math.ceil(listing.priceCents / 100) : 0;
    
    // If paying with credits, check if user has sufficient balance
    if (validatedData.paymentMethod === 'credits' && creditsRequired > 0) {
      if (user.credits < creditsRequired) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            required: creditsRequired,
            available: user.credits,
          },
          { status: 400 }
        );
      }
    }

    // Create booking with credit transactions if paying with credits
    if (validatedData.paymentMethod === 'credits' && creditsRequired > 0) {
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction([
        // Create booking
        prisma.booking.create({
          data: {
            userId: user.id,
            listingId: validatedData.listingId,
            startAt,
            endAt,
            priceCents: listing.priceCents,
            creditsUsed: creditsRequired,
            status: 'PENDING',
            reminderSent: false,
          },
        }),
        // Deduct credits from creator (buyer)
        prisma.user.update({
          where: { id: user.id },
          data: { credits: { decrement: creditsRequired } },
        }),
        // Add credits to provider (seller)
        prisma.user.update({
          where: { id: listing.ownerId },
          data: { credits: { increment: creditsRequired } },
        }),
        // Create transaction record for creator (debit)
        prisma.creditTransaction.create({
          data: {
            userId: user.id,
            amount: -creditsRequired,
            reason: `Booking payment for listing ${listing.id}`,
          },
        }),
        // Create transaction record for provider (credit)
        prisma.creditTransaction.create({
          data: {
            userId: listing.ownerId,
            amount: creditsRequired,
            reason: `Booking payment received for listing ${listing.id}`,
          },
        }),
      ]);

      const booking = result[0];

      return NextResponse.json({
        success: true,
        booking: {
          id: booking.id,
          startAt: booking.startAt,
          endAt: booking.endAt,
          status: booking.status,
          creditsUsed: booking.creditsUsed,
        },
      });
    }

    // Create booking without credit payment (cash)
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        listingId: validatedData.listingId,
        startAt,
        endAt,
        priceCents: listing.priceCents,
        status: 'PENDING', // Provider needs to confirm
        reminderSent: false,
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        startAt: booking.startAt,
        endAt: booking.endAt,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
