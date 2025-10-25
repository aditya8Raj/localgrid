import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: projectId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, userType: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only SKILL_PROVIDER can join projects
    if (user.userType !== 'SKILL_PROVIDER') {
      return NextResponse.json(
        { error: 'Only skill providers can join projects' },
        { status: 403 }
      );
    }

    // Get the project
    const project = await prisma.communityProject.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        ownerId: true,
        title: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (project.ownerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot join your own project' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMembership = await prisma.projectMember.findFirst({
      where: {
        userId: user.id,
        projectId: projectId,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this project' },
        { status: 400 }
      );
    }

    // Create project membership
    const membership = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: projectId,
        role: 'MEMBER',
      },
    });

    return NextResponse.json({
      success: true,
      message: `You have successfully joined "${project.title}"`,
      membership: {
        id: membership.id,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error('Join project error:', error);
    return NextResponse.json(
      { error: 'Failed to join project' },
      { status: 500 }
    );
  }
}
