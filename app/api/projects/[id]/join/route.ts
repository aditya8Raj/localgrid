import { NextResponse } from 'next/server';
import { getUser } from '@/lib/server-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUser();
    const { id: projectId } = await params;

    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { id: true, userType: true },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only SKILL_PROVIDER can join projects
    if (authUser.userType !== 'SKILL_PROVIDER') {
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
    if (project.ownerId === authUser.id) {
      return NextResponse.json(
        { error: 'You cannot join your own project' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMembership = await prisma.projectMember.findFirst({
      where: {
        userId: authUser.id,
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
        userId: authUser.id,
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
