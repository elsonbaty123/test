import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getDb() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query'],
    })
  }
  return globalForPrisma.prisma
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = getDb()