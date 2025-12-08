import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. BRAND User ve Profile oluştur
  const brandUser = await prisma.user.upsert({
    where: { email: 'brand@example.com' },
    update: {
      passwordHash: 'brand123',
    },
    create: {
      email: 'brand@example.com',
      passwordHash: 'brand123',
      role: 'BRAND',
      status: 'APPROVED',
      brandProfile: {
        create: {
          companyName: 'INFCO Demo Brand',
          website: 'https://infco-demo-brand.com',
          description: 'INFCO demo markası',
        },
      },
    },
    include: {
      brandProfile: true,
    },
  })

  console.log('✅ Brand user created:', brandUser.email)

  // 1.1. ADMIN User ve Profile oluştur
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@infco.app' },
    update: {
      passwordHash: 'admin123',
    },
    create: {
      email: 'admin@infco.app',
      passwordHash: 'admin123',
      role: 'BRAND',
      status: 'APPROVED',
      brandProfile: {
        create: {
          companyName: 'INFCO Admin',
          website: null,
          description: 'System Admin',
          logoUrl: null,
        },
      },
    },
    include: {
      brandProfile: true,
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // 2. INFLUENCER User ve Profile oluştur
  const influencerUser = await prisma.user.upsert({
    where: { email: 'influencer@example.com' },
    update: {
      passwordHash: 'influencer123',
    },
    create: {
      email: 'influencer@example.com',
      passwordHash: 'influencer123',
      role: 'INFLUENCER',
      status: 'APPROVED',
      influencerProfile: {
        create: {
          displayName: 'Demo Influencer',
          bio: 'INFCO demo influencer profili',
          category: 'beauty',
          followerCount: 120000,
          country: 'TR',
        },
      },
    },
    include: {
      influencerProfile: true,
    },
  })

  console.log('✅ Influencer user created:', influencerUser.email)

  // 2.1. Influencer için Wallet oluştur veya güncelle
  const influencerWallet = await prisma.wallet.upsert({
    where: { userId: influencerUser.id },
    update: { balance: 1250.75 },
    create: {
      userId: influencerUser.id,
      balance: 1250.75,
    },
  })

  console.log('✅ Influencer wallet created:', influencerWallet.id, 'Balance:', influencerWallet.balance)

  // Brand profile'ı al (eğer yoksa oluşturulmuş olanı kullan)
  const brandProfile = brandUser.brandProfile || await prisma.brandProfile.findUnique({
    where: { userId: brandUser.id },
  })

  if (!brandProfile) {
    throw new Error('Brand profile not found')
  }

  // 3. Kampanyalar oluştur
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 30)

  // Kampanya 1: Yeni Ruj Lansmanı
  const campaign1 = await prisma.campaign.create({
    data: {
      brandId: brandProfile.id,
      title: 'Yeni Ruj Lansmanı',
      description: 'Yeni ruj serimizi tanıtıyoruz.',
      platform: 'TikTok',
      totalPool: 10000,
      pricePerView: 0.01,
      maxCpm: 10,
      status: 'ACTIVE',
      startDate: today,
      endDate: endDate,
    },
  })

  console.log('✅ Campaign 1 created:', campaign1.title)

  // Kampanya 2: Yaz İndirimi
  const campaign2 = await prisma.campaign.create({
    data: {
      brandId: brandProfile.id,
      title: 'Yaz İndirimi',
      description: 'Yaz koleksiyonu indirimi.',
      platform: 'Instagram',
      totalPool: 20000,
      pricePerView: 0.015,
      maxCpm: 15,
      status: 'ACTIVE',
      startDate: today,
      endDate: endDate,
    },
  })

  console.log('✅ Campaign 2 created:', campaign2.title)

  // Kampanya 3: Gaming Kulaklık Tanıtımı
  const campaign3 = await prisma.campaign.create({
    data: {
      brandId: brandProfile.id,
      title: 'Gaming Kulaklık Tanıtımı',
      description: 'Yeni gaming kulaklığımızı tanıt.',
      platform: 'YouTube',
      totalPool: 15000,
      pricePerView: 0.02,
      maxCpm: 20,
      status: 'DRAFT',
      startDate: today,
      endDate: endDate,
    },
  })

  console.log('✅ Campaign 3 created:', campaign3.title)

  // 4. Influencer Wallet Transaction'ları oluştur
  // Önce eski transaction'ları sil
  await prisma.walletTransaction.deleteMany({
    where: { walletId: influencerWallet.id },
  })

  // Örnek transaction tarihleri oluştur
  const transactionDate1 = new Date(today)
  transactionDate1.setDate(today.getDate() - 10) // 10 gün önce

  const transactionDate2 = new Date(today)
  transactionDate2.setDate(today.getDate() - 7) // 7 gün önce

  const transactionDate3 = new Date(today)
  transactionDate3.setDate(today.getDate() - 5) // 5 gün önce

  const transactionDate4 = new Date(today)
  transactionDate4.setDate(today.getDate() - 3) // 3 gün önce

  const transactionDate5 = new Date(today)
  transactionDate5.setDate(today.getDate() - 1) // 1 gün önce

  // Transaction 1: Kampanya kazancı
  await prisma.walletTransaction.create({
    data: {
      walletId: influencerWallet.id,
      type: 'EARNING',
      amount: 250.5,
      relatedCampaignId: campaign1.id,
      createdAt: transactionDate1,
    },
  })

  // Transaction 2: Kampanya kazancı
  await prisma.walletTransaction.create({
    data: {
      walletId: influencerWallet.id,
      type: 'EARNING',
      amount: 180.25,
      relatedCampaignId: campaign2.id,
      createdAt: transactionDate2,
    },
  })

  // Transaction 3: Para çekme
  await prisma.walletTransaction.create({
    data: {
      walletId: influencerWallet.id,
      type: 'WITHDRAWAL',
      amount: -500.0,
      createdAt: transactionDate3,
    },
  })

  // Transaction 4: Kampanya kazancı
  await prisma.walletTransaction.create({
    data: {
      walletId: influencerWallet.id,
      type: 'EARNING',
      amount: 320.75,
      relatedCampaignId: campaign1.id,
      createdAt: transactionDate4,
    },
  })

  // Transaction 5: Para çekme
  await prisma.walletTransaction.create({
    data: {
      walletId: influencerWallet.id,
      type: 'WITHDRAWAL',
      amount: -200.0,
      createdAt: transactionDate5,
    },
  })

  console.log('✅ Wallet transactions created for influencer wallet')

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

