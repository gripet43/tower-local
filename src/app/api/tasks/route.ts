import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Lightweight include for list view (no full subtasks/comments/activityLogs)
const listInclude = {
  taskTags: { include: { tag: true } },
  _count: { select: { subtasks: true, comments: true, attachments: true, taskTags: true } },
}

// GET /api/tasks - list with filters
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const projectId = sp.get('projectId')
  if (!projectId) return NextResponse.json([])

  const where: Record<string, unknown> = { projectId }

  // Filters
  if (sp.get('sectionId')) where.sectionId = sp.get('sectionId')
  if (sp.get('completed') !== null && sp.get('completed') !== '') where.completed = sp.get('completed') === 'true'
  if (sp.get('priority')) where.priority = sp.get('priority')
  if (sp.get('due') === 'has') where.dueDate = { not: null }
  if (sp.get('due') === 'none') where.dueDate = null
  if (sp.get('q')) where.title = { contains: sp.get('q') }
  if (sp.get('tagId')) {
    where.taskTags = { some: { tagId: sp.get('tagId') } }
  }

  try {
    return NextResponse.json(await prisma.task.findMany({
      where,
      include: listInclude,
      orderBy: [{ sectionId: 'asc' }, { sortOrder: 'asc' }],
    }))
  } catch {
    return NextResponse.json([])
  }
}

// POST /api/tasks - create task
export async function POST(req: NextRequest) {
  const { projectId, sectionId, title } = await req.json()
  const maxN = await prisma.task.findFirst({ where: { projectId }, orderBy: { taskNumber: 'desc' }, select: { taskNumber: true } })
  const maxO = await prisma.task.findFirst({ where: { projectId, sectionId: sectionId || null }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } })
  const task = await prisma.task.create({
    data: {
      projectId,
      sectionId: sectionId || null,
      taskNumber: (maxN?.taskNumber ?? 0) + 1,
      title,
      sortOrder: (maxO?.sortOrder ?? -1) + 1,
    },
    include: listInclude,
  })
  await prisma.activityLog.create({ data: { taskId: task.id, actionType: 'created', newValue: title } })
  return NextResponse.json(task)
}
