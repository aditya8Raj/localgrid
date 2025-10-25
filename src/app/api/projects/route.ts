import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating/updating projects
const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

// Validation schema for joining project
const joinProjectSchema = z.object({
  projectId: z.string().cuid(),
})

// Validation schema for updating project status
const updateStatusSchema = z.object({
  projectId: z.string().cuid(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']),
})

// Validation schema for member management
const memberActionSchema = z.object({
  projectId: z.string().cuid(),
  userId: z.string().cuid(),
  action: z.enum(['add', 'remove', 'promote', 'demote']),
})

/**
 * GET /api/projects
 * List projects with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const ownerId = searchParams.get('ownerId')
    const memberId = searchParams.get('memberId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    type WhereClause = {
      status?: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD'
      ownerId?: string
      members?: {
        some: {
          userId: string
        }
      }
    }

    const where: WhereClause = {}

    if (status && ['ACTIVE', 'COMPLETED', 'ON_HOLD'].includes(status)) {
      where.status = status as 'ACTIVE' | 'COMPLETED' | 'ON_HOLD'
    }

    if (ownerId) {
      where.ownerId = ownerId
    }

    if (memberId) {
      where.members = {
        some: {
          userId: memberId,
        },
      }
    }

    const [projects, total] = await Promise.all([
      prisma.communityProject.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
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
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.communityProject.count({ where }),
    ])

    return NextResponse.json({
      projects,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects
 * Create a new project or perform member actions
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
    const action = body.action // 'create', 'join', 'member-action'

    if (action === 'create' || !action) {
      // Create new project
      const validatedData = projectSchema.parse(body)

      const project = await prisma.communityProject.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          ownerId: session.user.id,
          status: 'ACTIVE',
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
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
        },
      })

      return NextResponse.json(
        { message: 'Project created successfully', project },
        { status: 201 }
      )
    } else if (action === 'join') {
      // Join existing project
      const validatedData = joinProjectSchema.parse(body)

      // Check if project exists
      const project = await prisma.communityProject.findUnique({
        where: { id: validatedData.projectId },
      })

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      // Check if already a member
      const existingMember = await prisma.projectMember.findFirst({
        where: {
          projectId: validatedData.projectId,
          userId: session.user.id,
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: 'You are already a member of this project' },
          { status: 400 }
        )
      }

      // Add as member
      const membership = await prisma.projectMember.create({
        data: {
          projectId: validatedData.projectId,
          userId: session.user.id,
          role: 'MEMBER',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      })

      return NextResponse.json({
        message: 'Successfully joined project',
        membership,
      })
    } else if (action === 'member-action') {
      // Member management (promote/demote/remove)
      const validatedData = memberActionSchema.parse(body)

      // Check if project exists and user is owner or manager
      const project = await prisma.communityProject.findUnique({
        where: { id: validatedData.projectId },
        include: {
          members: {
            where: { userId: session.user.id },
          },
        },
      })

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      const isOwner = project.ownerId === session.user.id
      const isManager = project.members.some(
        m => m.userId === session.user.id && m.role === 'MANAGER'
      )

      if (!isOwner && !isManager) {
        return NextResponse.json(
          { error: 'Only project owner or managers can manage members' },
          { status: 403 }
        )
      }

      // Perform action
      if (validatedData.action === 'remove') {
        // Cannot remove owner
        if (validatedData.userId === project.ownerId) {
          return NextResponse.json(
            { error: 'Cannot remove project owner' },
            { status: 400 }
          )
        }

        await prisma.projectMember.deleteMany({
          where: {
            projectId: validatedData.projectId,
            userId: validatedData.userId,
          },
        })

        return NextResponse.json({
          message: 'Member removed successfully',
        })
      } else if (validatedData.action === 'promote') {
        // Only owner can promote
        if (!isOwner) {
          return NextResponse.json(
            { error: 'Only project owner can promote members' },
            { status: 403 }
          )
        }

        await prisma.projectMember.updateMany({
          where: {
            projectId: validatedData.projectId,
            userId: validatedData.userId,
          },
          data: {
            role: 'MANAGER',
          },
        })

        return NextResponse.json({
          message: 'Member promoted to manager',
        })
      } else if (validatedData.action === 'demote') {
        // Only owner can demote
        if (!isOwner) {
          return NextResponse.json(
            { error: 'Only project owner can demote members' },
            { status: 403 }
          )
        }

        await prisma.projectMember.updateMany({
          where: {
            projectId: validatedData.projectId,
            userId: validatedData.userId,
          },
          data: {
            role: 'MEMBER',
          },
        })

        return NextResponse.json({
          message: 'Member demoted to regular member',
        })
      } else if (validatedData.action === 'add') {
        // Add member directly (owner/manager only)
        const existingMember = await prisma.projectMember.findFirst({
          where: {
            projectId: validatedData.projectId,
            userId: validatedData.userId,
          },
        })

        if (existingMember) {
          return NextResponse.json(
            { error: 'User is already a member' },
            { status: 400 }
          )
        }

        const membership = await prisma.projectMember.create({
          data: {
            projectId: validatedData.projectId,
            userId: validatedData.userId,
            role: 'MEMBER',
          },
        })

        return NextResponse.json({
          message: 'Member added successfully',
          membership,
        })
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
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

    console.error('Error processing project request:', error)
    return NextResponse.json(
      { error: 'Failed to process project request' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/projects
 * Update project details or status
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, status, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check if project exists
    const existingProject = await prisma.communityProject.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const isOwner = existingProject.ownerId === session.user.id
    const isManager = existingProject.members.some(
      m => m.userId === session.user.id && m.role === 'MANAGER'
    )

    // Check permissions
    if (!isOwner && !isManager) {
      return NextResponse.json(
        { error: 'You do not have permission to update this project' },
        { status: 403 }
      )
    }

    // Validate update data
    const validatedData = projectSchema.partial().parse(updateData)

    // If updating status, validate it
    let updatedStatus = existingProject.status
    if (status) {
      const statusValidation = updateStatusSchema.parse({ projectId: id, status })
      updatedStatus = statusValidation.status
    }

    const updatedProject = await prisma.communityProject.update({
      where: { id },
      data: {
        ...validatedData,
        status: updatedStatus,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
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
      },
    })

    return NextResponse.json({
      message: 'Project updated successfully',
      project: updatedProject,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects
 * Delete a project (owner only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check if project exists
    const existingProject = await prisma.communityProject.findUnique({
      where: { id },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is owner
    if (existingProject.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only project owner can delete the project' },
        { status: 403 }
      )
    }

    // Delete project (cascade will delete members)
    await prisma.communityProject.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Project deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
