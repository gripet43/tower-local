import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const pid = req.nextUrl.searchParams.get('projectId')
  if (!pid) return NextResponse.json([])
  return NextResponse.json(await prisma.section.findMany({ where: { projectId: pid }, orderBy: { sortOrder: 'asc' } }))
}

export async function POST(req: NextRequest) {
  const { projectId, name } = await req.json()
  const max = await prisma.section.findFirst({ where: { projectId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } })
  return NextResponse.json(await prisma.section.create({ data: { projectId, name, sortOrder: (max?.sortOrder ?? -1) + 1 } }))
}
