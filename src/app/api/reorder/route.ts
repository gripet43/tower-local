import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/reorder
// Body: { type: "task"|"section", items: [{ id, sortOrder, sectionId? }] }
export async function POST(req: NextRequest) {
  const { type, items } = await req.json()

  if (type === 'task') {
    for (const item of items) {
      const d: Record<string, unknown> = { sortOrder: item.sortOrder }
      if (item.sectionId !== undefined) d.sectionId = item.sectionId || null
      await prisma.task.update({ where: { id: item.id }, data: d })
    }
  } else if (type === 'section') {
    for (const item of items) {
      await prisma.section.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
    }
  }

  return NextResponse.json({ ok: true })
}
