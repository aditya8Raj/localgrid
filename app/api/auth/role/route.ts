import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized. Please check server configuration.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userType } = z.object({
      userType: z.enum(['SKILL_PROVIDER', 'PROJECT_CREATOR']),
    }).parse(body);

    // Get Firebase token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in again' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { email } = decodedToken;

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 400 }
      );
    }

    console.log('Attempting to update user:', email, 'with userType:', userType);

    // Update user's userType in database
    const updatedUser = await prisma.user.update({
      where: { email },
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

    // CRITICAL: Return success with user data
    return NextResponse.json({
      success: true,
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
