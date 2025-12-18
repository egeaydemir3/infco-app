import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin kullanıcı kontrolü ve oluşturma
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN',
    },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@infcoapp.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
      },
    })

    console.log('✅ Admin user created:', adminUser.email)
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation')
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
