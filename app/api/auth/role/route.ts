import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userType, userId } = z.object({
      userType: z.enum(['SKILL_PROVIDER', 'PROJECT_CREATOR']),
      userId: z.string().optional(),
    }).parse(body);

    // Try to get session first
    const session = await auth();
    
    let userEmail: string | null = null;
    let userIdToUpdate: string | null = null;

    if (session?.user?.email) {
      userEmail = session.user.email;
    } else if (userId) {
      // If no session but userId provided, fetch user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      
      if (user) {
        userEmail = user.email;
        userIdToUpdate = userId;
      }
    }

    if (!userEmail) {
      console.error('No session or userId found');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in again' },
        { status: 401 }
      );
    }

    console.log('Attempting to update user:', userEmail, 'with userType:', userType);

    // Update user's userType in database
    const updatedUser = await prisma.user.update({
      where: userIdToUpdate ? { id: userIdToUpdate } : { email: userEmail },
      data: { userType },
    });

    console.log('User updated successfully:', updatedUser.id);

    // Send welcome email with role-specific content
    try {
      await sendWelcomeEmail(updatedUser.id);
      console.log('Welcome email sent to:', updatedUser.email);
    } catch (emailError) {
      // Log error but don't block the response
      console.error('Failed to send welcome email:', emailError);
    }

    // CRITICAL: Return special flag to trigger session refresh
    return NextResponse.json({
      success: true,
      requiresSessionRefresh: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        userType: updatedUser.userType,
      },
    });
  } catch (error) {
    console.error('Role selection error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid role selection', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save role selection',
        details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
