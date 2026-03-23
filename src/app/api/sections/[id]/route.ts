import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, sortOrder } = await req.json()
  const d: Record<string, unknown> = {}
  if (name !== undefined) d.name = name
  if (sortOrder !== undefined) d.sortOrder = sortOrder
  return NextResponse.json(await prisma.section.update({ where: { id }, data: d }))
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.section.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
