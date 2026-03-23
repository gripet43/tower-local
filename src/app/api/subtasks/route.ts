import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { taskId, title } = await req.json()
  const max = await prisma.subtask.findFirst({ where: { taskId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } })
  const sub = await prisma.subtask.create({ data: { taskId, title, sortOrder: (max?.sortOrder ?? -1) + 1 } })
  await prisma.activityLog.create({ data: { taskId, actionType: 'subtask_added', newValue: title } })
  return NextResponse.json(sub)
}
