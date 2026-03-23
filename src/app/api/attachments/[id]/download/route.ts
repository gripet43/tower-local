import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const att = await prisma.attachment.findUnique({ where: { id } })
  if (!att) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const file = await readFile(join(process.cwd(), 'uploads', att.storageName))
    return new NextResponse(file, {
      headers: {
        'Content-Type': att.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(att.fileName)}"`,
        'Content-Length': String(att.fileSize),
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
