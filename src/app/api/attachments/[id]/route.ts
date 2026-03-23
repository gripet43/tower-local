import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const att = await prisma.attachment.findUnique({ where: { id } })
  if (att) {
    try { await unlink(join(process.cwd(), 'uploads', att.storageName)) } catch {}
    await prisma.activityLog.create({ data: { taskId: att.taskId, actionType: 'attachment_deleted', oldValue: att.fileName } })
  }
  await prisma.attachment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
