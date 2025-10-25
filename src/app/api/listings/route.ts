import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { searchListingsNearby, validateCoordinates } from '@/lib/geo'
import { z } from 'zod'

// Validation schema for creating/updating listings
const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  skillTags: z.array(z.string()).min(1, 'At least one skill tag is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  priceCents: z.number().int().nonnegative().optional().nullable(),
  durationMins: z.number().int().positive(),
})

/**
 * GET /api/listings
 * Search and list listings with optional geo-filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get query parameters
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radiusKm = searchParams.get('radius')
    const tags = searchParams.get('tags') // Comma-separated
    const ownerId = searchParams.get('ownerId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // If lat/lng/radius provided, use geo search
    if (lat && lng && radiusKm) {
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      const radius = parseFloat(radiusKm)

      if (!validateCoordinates(latitude, longitude)) {
        return NextResponse.json(
          { error: 'Invalid coordinates' },
          { status: 400 }
        )
      }

      const listings = await searchListingsNearby(latitude, longitude, radius)

      // Fetch owner data for each listing
      const listingsWithOwners = await Promise.all(
        listings.map(async (listing) => {
          const owner = await prisma.user.findUnique({
            where: { id: listing.ownerId },
            select: {
              id: true,
              name: true,
              image: true,
            },
          })
          return {
            ...listing,
            owner: owner || { id: listing.ownerId, name: null, image: null },
          }
        })
      )

      // Apply additional filters
      let filtered = listingsWithOwners

      if (tags) {
        const tagArray = tags.split(',').map(t => t.trim().toLowerCase())
        filtered = filtered.filter(listing =>
          listing.skillTags.some(tag => 
            tagArray.some(searchTag => tag.toLowerCase().includes(searchTag))
          )
        )
      }

      if (ownerId) {
        filtered = filtered.filter(listing => listing.ownerId === ownerId)
      }

      // Apply pagination
      const paginated = filtered.slice(offset, offset + limit)

      return NextResponse.json({
        listings: paginated,
        total: filtered.length,
        limit,
        offset,
      })
    }

    // Regular listing without geo search
    const where: {
      isActive: boolean
      ownerId?: string
      skillTags?: { hasSome: string[] }
    } = {
      isActive: true,
    }

    if (ownerId) {
      where.ownerId = ownerId
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim())
      where.skillTags = {
        hasSome: tagArray,
      }
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
              locationCity: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/listings
 * Create a new listing
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
    const validatedData = listingSchema.parse(body)

    if (!validateCoordinates(validatedData.lat, validatedData.lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
      },
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
    })

    return NextResponse.json(
      { message: 'Listing created successfully', listing },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/listings
 * Update an existing listing
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (existingListing.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this listing' },
        { status: 403 }
      )
    }

    // Validate update data
    const validatedData = listingSchema.partial().parse(updateData)

    if (validatedData.lat && validatedData.lng) {
      if (!validateCoordinates(validatedData.lat, validatedData.lng)) {
        return NextResponse.json(
          { error: 'Invalid coordinates' },
          { status: 400 }
        )
      }
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: validatedData,
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
    })

    return NextResponse.json({
      message: 'Listing updated successfully',
      listing: updatedListing,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/listings
 * Delete (deactivate) a listing
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
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (existingListing.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this listing' },
        { status: 403 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.listing.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
