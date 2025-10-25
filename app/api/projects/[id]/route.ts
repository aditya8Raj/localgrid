import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProjectSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const project = await prisma.communityProject.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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

    // Get the project to check ownership
    const existingProject = await prisma.communityProject.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || user.id !== existingProject.ownerId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own projects' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Update the project
    const project = await prisma.communityProject.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
      },
    });
  } catch (error) {
    console.error('Update project error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
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

    // Get the project to check ownership
    const existingProject = await prisma.communityProject.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || user.id !== existingProject.ownerId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own projects' },
        { status: 403 }
      );
    }

    // Delete the project and all related data
    await prisma.$transaction([
      // Delete project members first
      prisma.projectMember.deleteMany({
        where: { projectId: id },
      }),
      // Then delete the project
      prisma.communityProject.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
