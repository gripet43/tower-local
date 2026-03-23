import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title, completed, sortOrder } = await req.json()
  const d: Record<string, unknown> = {}
  if (title !== undefined) d.title = title
  if (completed !== undefined) d.completed = completed
  if (sortOrder !== undefined) d.sortOrder = sortOrder
  const old = await prisma.subtask.findUnique({ where: { id } })
  const sub = await prisma.subtask.update({ where: { id }, data: d })
  if (completed !== undefined && old) {
    await prisma.activityLog.create({ data: { taskId: old.taskId, actionType: completed ? 'subtask_completed' : 'subtask_uncompleted', newValue: old.title } })
  }
  return NextResponse.json(sub)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await prisma.subtask.findUnique({ where: { id } })
  if (sub) await prisma.activityLog.create({ data: { taskId: sub.taskId, actionType: 'subtask_deleted', oldValue: sub.title } })
  await prisma.subtask.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
