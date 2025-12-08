import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import ApplicationsClient from './ApplicationsClient'
import LogoutButton from '@/components/LogoutButton'
import AccessDenied from '@/components/AccessDenied'

export default async function ApplicationsPage() {
  // Oturum açan kullanıcıyı bul
  const user = await getCurrentUser()

  // Eğer user yoksa, influencerProfile yoksa veya role INFLUENCER değilse erişim reddedildi
  if (!user || !user.influencerProfile || user.role !== 'INFLUENCER') {
    return (
      <AccessDenied
        message="Bu alanı görmek için influencer olarak giriş yapmalısınız."
        loginUrl="/auth/login?role=influencer"
      />
    )
  }

  // CampaignApplication'ları çek (campaign pricePerView ve contents ile birlikte)
  const applications = await prisma.campaignApplication.findMany({
    where: { influencerId: user.influencerProfile.id },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          platform: true,
          pricePerView: true,
          brand: {
            select: {
              companyName: true,
            },
          },
        },
      },
      contents: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      {/* SOL SÜTUN - Sidebar */}
      <div className="relative z-10 w-64 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col">
        {/* INFCO Başlığı */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-black tracking-tighter select-none">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              INFCO
            </span>
          </h1>
        </div>

        {/* Navigasyon Menüsü */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/influencer/profile"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Profil
          </Link>
          <Link
            href="/influencer/campaigns"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Kampanyaları Keşfet
          </Link>
          <div className="px-4 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white">
            Aktif Kampanyalarım
          </div>
          <Link
            href="/influencer/wallet"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Cüzdan
          </Link>
          <div className="px-4 py-3 rounded-lg bg-white/5 text-gray-300 font-medium cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
            Ayarlar
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </div>

      {/* Client Component - Başvuru Listesi ve Panel */}
      <ApplicationsClient
        applications={applications.map((app) => ({
          ...app,
          campaign: {
            ...app.campaign,
            pricePerView: app.campaign.pricePerView ?? 0,
          },
        }))}
      />
    </div>
  )
}
