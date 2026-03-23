import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { taskId, content } = await req.json()
  const c = await prisma.comment.create({ data: { taskId, content } })
  await prisma.activityLog.create({ data: { taskId, actionType: 'comment_added', newValue: content.substring(0, 100) } })
  return NextResponse.json(c)
}
