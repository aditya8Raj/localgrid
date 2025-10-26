import { NextResponse } from 'next/server';
import { getUser } from '@/lib/server-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authUser = await getUser();

    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { 
        id: true,
        credits: true,
      },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get transaction history
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 transactions
    });

    return NextResponse.json({
      balance: user.credits,
      transactions,
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
