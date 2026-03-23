import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/projects - list all projects
export async function GET() {
  return NextResponse.json(await prisma.project.findMany({ orderBy: { createdAt: 'asc' } }))
}

// POST /api/projects - create project
export async function POST(req: NextRequest) {
  const { name } = await req.json()
  return NextResponse.json(await prisma.project.create({ data: { name } }))
}
