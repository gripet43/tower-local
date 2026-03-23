import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await prisma.comment.findUnique({ where: { id } })
  if (c) await prisma.activityLog.create({ data: { taskId: c.taskId, actionType: 'comment_deleted', oldValue: c.content.substring(0, 100) } })
  await prisma.comment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
