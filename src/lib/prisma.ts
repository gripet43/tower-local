import { PrismaClient } from '@prisma/client'

function getPrismaUrl() {
  if (process.env.VERCEL) return 'file:/tmp/tower.db'
  return process.env.DATABASE_URL || 'file:./dev.db'
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: getPrismaUrl() } }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
export { prisma }
