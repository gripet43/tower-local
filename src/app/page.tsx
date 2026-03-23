import { redirect } from 'next/navigation'

export default async function Home() {
  // Default: redirect to first project
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  const first = await prisma.project.findFirst({ orderBy: { createdAt: 'asc' } })
  if (first) redirect(`/projects/${first.id}`)
  return null
}
