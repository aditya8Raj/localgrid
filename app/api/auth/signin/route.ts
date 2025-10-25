import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      );
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create or update user in database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          id: uid,
          email,
          name: name || null,
          image: picture || null,
          userType: null, // Will be set in role selection
          role: 'USER',
          isVerified: false,
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          image: picture || user.image,
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      userType: user.userType,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
