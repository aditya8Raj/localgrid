import { NextResponse } from 'next/server';
import { getUser } from '@/lib/server-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUser();
    const { id } = await params;

    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the booking with listing info
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
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

    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { id: true },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is the listing owner (provider)
    if (booking.listing.ownerId !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the provider can decline bookings' },
        { status: 403 }
      );
    }

    // Check if booking is in PENDING status
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending bookings can be declined' },
        { status: 400 }
      );
    }

    // Update booking status to DECLINED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'DECLINED',
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
      },
    });
  } catch (error) {
    console.error('Decline booking error:', error);
    return NextResponse.json(
      { error: 'Failed to decline booking' },
      { status: 500 }
    );
  }
}
