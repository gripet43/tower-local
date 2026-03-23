import { PrismaClient } from '@prisma/client'
import ProjectWorkspace from '@/components/ProjectWorkspace'

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const prisma = new PrismaClient()
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { sections: { orderBy: { sortOrder: 'asc' } } } })
  if (!project) return <div className="text-center py-20 text-gray-400">项目不存在</div>
  return <ProjectWorkspace projectId={projectId} project={project} />
}
