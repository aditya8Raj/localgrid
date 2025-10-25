import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const onboardingSchema = z.object({
  userType: z.enum(['SKILL_PROVIDER', 'PROJECT_CREATOR']),
})

/**
 * PATCH /api/users/onboarding
 * Update user type during onboarding (first-time OAuth users)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = onboardingSchema.parse(body)

    // Check if user already has a userType set
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true, createdAt: true },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user was created more than 1 hour ago
    const hoursSinceCreation = (Date.now() - existingUser.createdAt.getTime()) / (1000 * 60 * 60)
    
    // Only allow update if:
    // 1. User was created recently (within 1 hour) - prevents old users from changing
    // 2. User still has default SKILL_PROVIDER type - indicates they haven't chosen yet
    if (hoursSinceCreation > 1) {
      return NextResponse.json(
        { error: 'Onboarding period has expired. User type cannot be changed.' },
        { status: 400 }
      )
    }

    // If user already selected a different type, don't allow change
    if (existingUser.userType !== 'SKILL_PROVIDER' && existingUser.userType !== validatedData.userType) {
      return NextResponse.json(
        { error: 'User type already set and cannot be changed' },
        { status: 400 }
      )
    }

    // Update user type
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        userType: validatedData.userType,
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: 'User type updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to update user type' },
      { status: 500 }
    )
  }
}
