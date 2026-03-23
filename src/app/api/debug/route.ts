import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`
    const projectCount = await prisma.project.count().catch(() => -1)
    return NextResponse.json({
      ok: true,
      vercel: !!process.env.VERCEL,
      dbUrl: process.env.DATABASE_URL || '(using schema default)',
      tables,
      projectCount
    })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
  }
}
