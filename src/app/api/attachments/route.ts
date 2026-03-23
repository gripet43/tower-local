import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

// POST /api/attachments - upload file
export async function POST(req: NextRequest) {
  const fd = await req.formData()
  const taskId = fd.get('taskId') as string
  const file = fd.get('file') as File
  if (!taskId || !file) return NextResponse.json({ error: 'Missing' }, { status: 400 })

  await mkdir(UPLOAD_DIR, { recursive: true })
  const buf = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || ''
  const storageName = `${randomUUID()}.${ext}`
  await writeFile(join(UPLOAD_DIR, storageName), buf)

  const att = await prisma.attachment.create({
    data: { taskId, fileName: file.name, storageName, mimeType: file.type || 'application/octet-stream', fileSize: buf.length },
  })
  await prisma.activityLog.create({ data: { taskId, actionType: 'attachment_added', newValue: file.name } })
  return NextResponse.json(att)
}
