import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) { const pid = req.nextUrl.searchParams.get('projectId'); if (!pid) return NextResponse.json([]); return NextResponse.json(await prisma.tag.findMany({ where: { projectId: pid } })) }
export async function POST(req: NextRequest) { const { projectId, name, color } = await req.json(); return NextResponse.json(await prisma.tag.create({ data: { projectId, name, color: color || '#6B7280' } })) }
