import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createProjectSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only PROJECT_CREATOR users can create projects
    if (session.user.userType !== 'PROJECT_CREATOR') {
      return NextResponse.json(
        { error: 'Only project creators can create projects' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create the project
    const project = await prisma.communityProject.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        ownerId: user.id,
        status: 'ACTIVE',
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
    console.error('Create project error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await prisma.communityProject.findMany({
      where: {
        status: 'ACTIVE',
      },
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
