import { PrismaClient } from '@prisma/client'

const dbUrl = process.env.VERCEL 
  ? 'file:/tmp/tower.db' 
  : (process.env.DATABASE_URL || 'file:./dev.db')

// Force set before PrismaClient initializes
process.env.DATABASE_URL = dbUrl

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
export { prisma }
