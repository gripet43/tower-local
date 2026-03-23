import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Full include for detail view
const detailInclude = {
  taskTags: { include: { tag: true } },
  attachments: { orderBy: { createdAt: 'desc' as const } },
  subtasks: { orderBy: { sortOrder: 'asc' as const } },
  comments: { orderBy: { createdAt: 'desc' as const } },
  activityLogs: { orderBy: { createdAt: 'desc' as const }, take: 100 },
}

// GET /api/tasks/[id] - full detail
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const task = await prisma.task.findUnique({ where: { id }, include: detailInclude })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

// PATCH /api/tasks/[id] - partial update with activity logging
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const u = await req.json()

  const old = await prisma.task.findUnique({ where: { id } })
  if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const d: Record<string, unknown> = {}
  const logs: { actionType: string; oldValue?: string; newValue?: string }[] = []

  if (u.title !== undefined && u.title !== old.title) {
    d.title = u.title
    logs.push({ actionType: 'title_changed', oldValue: old.title, newValue: u.title })
  }
  if (u.description !== undefined && u.description !== old.description) {
    d.description = u.description
    logs.push({ actionType: 'description_changed', oldValue: old.description, newValue: u.description })
  }
  if (u.dueDate !== undefined) {
    d.dueDate = u.dueDate ? new Date(u.dueDate) : null
    logs.push({ actionType: 'dueDate_changed', oldValue: old.dueDate?.toISOString() ?? '', newValue: u.dueDate ?? '' })
  }
  if (u.priority !== undefined && u.priority !== old.priority) {
    d.priority = u.priority
    logs.push({ actionType: 'priority_changed', oldValue: old.priority, newValue: u.priority })
  }
  if (u.sectionId !== undefined) {
    d.sectionId = u.sectionId || null
    logs.push({ actionType: 'section_changed', oldValue: old.sectionId ?? '', newValue: u.sectionId ?? '' })
  }
  if (u.sortOrder !== undefined) d.sortOrder = u.sortOrder
  if (u.completed !== undefined) {
    d.completed = u.completed
    d.completedAt = u.completed ? new Date() : null
    logs.push({ actionType: u.completed ? 'completed' : 'uncompleted' })
  }

  const task = await prisma.task.update({ where: { id }, data: d, include: detailInclude })
  for (const l of logs) await prisma.activityLog.create({ data: { taskId: id, ...l } })
  return NextResponse.json(task)
}

// DELETE /api/tasks/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
