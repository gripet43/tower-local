import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { taskId, tagId } = await req.json()
  const tt = await prisma.taskTag.create({ data: { taskId, tagId } })
  const tag = await prisma.tag.findUnique({ where: { id: tagId } })
  await prisma.activityLog.create({ data: { taskId, actionType: 'tag_added', newValue: tag?.name } })
  return NextResponse.json(tt)
}

export async function DELETE(req: NextRequest) {
  const tid = req.nextUrl.searchParams.get('taskId')
  const tgid = req.nextUrl.searchParams.get('tagId')
  if (!tid || !tgid) return NextResponse.json({ error: 'Missing' }, { status: 400 })
  const tag = await prisma.tag.findUnique({ where: { id: tgid } })
  await prisma.taskTag.delete({ where: { taskId_tagId: { taskId: tid, tagId: tgid } } })
  await prisma.activityLog.create({ data: { taskId: tid, actionType: 'tag_removed', oldValue: tag?.name } })
  return NextResponse.json({ ok: true })
}
