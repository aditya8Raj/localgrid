import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  skillTags: z.array(z.string()).min(1).max(10),
  priceCents: z.number().int().min(0),
  durationMins: z.number().int().min(15).max(480),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  locationCity: z.string().min(1),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the listing to check ownership
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || user.id !== existingListing.ownerId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own listings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateListingSchema.parse(body);

    // Update the listing
    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        skillTags: validatedData.skillTags,
        priceCents: validatedData.priceCents,
        durationMins: validatedData.durationMins,
        lat: validatedData.lat,
        lng: validatedData.lng,
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
    console.error('Update listing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid listing data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the listing to check ownership
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || user.id !== existingListing.ownerId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own listings' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.listing.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
