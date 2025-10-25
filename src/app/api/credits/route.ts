import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for credit transfer
const transferSchema = z.object({
  toUserId: z.string().cuid(),
  amount: z.number().int().positive(),
  reason: z.string().optional(),
})

// Validation schema for admin top-up
const topUpSchema = z.object({
  userId: z.string().cuid(),
  amount: z.number().int(),
  reason: z.string(),
})

/**
 * GET /api/credits
 * Get user's credit balance and transaction history
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
    const userId = searchParams.get('userId') || session.user.id
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if requesting another user's data (admin only)
    if (userId !== session.user.id) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })

      if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'You can only view your own credit balance' },
          { status: 403 }
        )
      }
    }

    // Get user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get transaction history
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.creditTransaction.count({
        where: { userId },
      }),
    ])

    // Calculate totals
    const stats = await prisma.creditTransaction.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    })

    const earned = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
      },
      _sum: {
        amount: true,
      },
    })

    const spent = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.credits,
      },
      stats: {
        totalEarned: earned._sum.amount || 0,
        totalSpent: Math.abs(spent._sum.amount || 0),
        netBalance: stats._sum.amount || 0,
      },
      transactions,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit information' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/credits
 * Transfer credits between users or admin top-up
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
    const action = body.action // 'transfer' or 'topup'

    if (action === 'topup') {
      // Admin top-up
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })

      if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admins can perform top-ups' },
          { status: 403 }
        )
      }

      const validatedData = topUpSchema.parse(body)

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: validatedData.userId },
      })

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Perform top-up in transaction
      const [updatedUser, transaction] = await prisma.$transaction([
        prisma.user.update({
          where: { id: validatedData.userId },
          data: {
            credits: {
              increment: validatedData.amount,
            },
          },
        }),
        prisma.creditTransaction.create({
          data: {
            userId: validatedData.userId,
            amount: validatedData.amount,
            reason: validatedData.reason,
          },
        }),
      ])

      return NextResponse.json({
        message: 'Credits added successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          credits: updatedUser.credits,
        },
        transaction,
      })
    } else if (action === 'transfer') {
      // User-to-user transfer
      const validatedData = transferSchema.parse(body)

      // Prevent self-transfer
      if (validatedData.toUserId === session.user.id) {
        return NextResponse.json(
          { error: 'You cannot transfer credits to yourself' },
          { status: 400 }
        )
      }

      // Get sender balance
      const sender = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true, name: true },
      })

      if (!sender) {
        return NextResponse.json(
          { error: 'Sender not found' },
          { status: 404 }
        )
      }

      // Check if sender has enough credits
      if (sender.credits < validatedData.amount) {
        return NextResponse.json(
          { error: `Insufficient credits. You have ${sender.credits} credits` },
          { status: 400 }
        )
      }

      // Check if recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: validatedData.toUserId },
        select: { id: true, name: true },
      })

      if (!recipient) {
        return NextResponse.json(
          { error: 'Recipient not found' },
          { status: 404 }
        )
      }

      // Perform transfer in transaction
      const [updatedSender, updatedRecipient] =
        await prisma.$transaction([
          // Deduct from sender
          prisma.user.update({
            where: { id: session.user.id },
            data: {
              credits: {
                decrement: validatedData.amount,
              },
            },
          }),
          // Add to recipient
          prisma.user.update({
            where: { id: validatedData.toUserId },
            data: {
              credits: {
                increment: validatedData.amount,
              },
            },
          }),
          // Record sender transaction
          prisma.creditTransaction.create({
            data: {
              userId: session.user.id,
              amount: -validatedData.amount,
              reason: validatedData.reason || `Transfer to ${recipient.name}`,
            },
          }),
          // Record recipient transaction
          prisma.creditTransaction.create({
            data: {
              userId: validatedData.toUserId,
              amount: validatedData.amount,
              reason: validatedData.reason || `Transfer from ${sender.name}`,
            },
          }),
        ])

      return NextResponse.json({
        message: 'Credits transferred successfully',
        sender: {
          id: updatedSender.id,
          credits: updatedSender.credits,
        },
        recipient: {
          id: updatedRecipient.id,
          credits: updatedRecipient.credits,
        },
        amount: validatedData.amount,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "transfer" or "topup"' },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error processing credit transaction:', error)
    return NextResponse.json(
      { error: 'Failed to process credit transaction' },
      { status: 500 }
    )
  }
}
