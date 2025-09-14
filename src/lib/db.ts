import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getDb() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV !== 'production' ? ['query', 'warn', 'error'] : ['warn', 'error'],
      errorFormat: process.env.NODE_ENV !== 'production' ? 'pretty' : 'minimal',
    })
  }
  return globalForPrisma.prisma
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = getDb()