import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Users, User } from 'lucide-react';
import Image from 'next/image';
import { ProjectActions } from '@/components/ProjectActions';
import { auth } from '@/lib/auth';

async function getProject(id: string) {
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
    },
  });

  if (!project) {
    return null;
  }

  return project;
}

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  // Check if current user is a member
  const session = await auth();
  const currentUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const isMember = currentUser
    ? project.members.some((member) => member.userId === currentUser.id)
    : false;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
                
                {/* Owner Info */}
                <div className="flex items-center gap-4 mb-6">
                  {project.owner.image ? (
                    <Image
                      src={project.owner.image}
                      alt={project.owner.name || 'Owner'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{project.owner.name}</p>
                    <p className="text-sm text-gray-600">Project Owner</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    project.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {/* Stats */}
              <div className="ml-8 text-right">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold">{project.members.length}</span>
                </div>
                <p className="text-sm text-gray-600">members</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this project</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Members */}
            {project.members.length > 0 && (
              <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      {member.user.image ? (
                        <Image
                          src={member.user.image}
                          alt={member.user.name || 'Member'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{member.user.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{member.role.toLowerCase()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <ProjectActions projectId={project.id} ownerId={project.ownerId} isMember={isMember} />
          </div>
        </div>

        {/* Project Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Project Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="text-gray-900 font-medium">
                {new Date(project.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-gray-900 font-medium">
                {new Date(project.updatedAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="text-gray-900 font-medium">{project.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
