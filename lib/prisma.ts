import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 için: Next.js ortamında adapter gerekmez, prisma.config.ts'den otomatik okunur
// Development'ta tek instance için globalThis kullanıyoruz
// ÖNEMLİ: Schema değişikliklerinden sonra development server'ı yeniden başlatın
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

