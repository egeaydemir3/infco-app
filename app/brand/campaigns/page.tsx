import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import CampaignsClient from './CampaignsClient'
import LogoutButton from '@/components/LogoutButton'
import AccessDenied from '@/components/AccessDenied'

export default async function BrandCampaignsPage() {
  // Oturum açan kullanıcıyı bul
  const user = await getCurrentUser()

  // Eğer user yoksa, brandProfile yoksa veya role BRAND değilse erişim reddedildi
  if (!user || !user.brandProfile || user.role !== 'BRAND') {
    return (
      <AccessDenied
        message="Bu alanı görmek için marka olarak giriş yapmalısınız."
        loginUrl="/auth/login?role=brand"
      />
    )
  }

  // Brand'in kampanyalarını çek
  const campaigns = await prisma.campaign.findMany({
    where: { brandId: user.brandProfile.id },
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
            href="/brand/dashboard"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>
          <div className="px-4 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white">
            Kampanyalarım
          </div>
          <Link
            href="/brand/campaigns/new"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Yeni Kampanya
          </Link>
          <div className="px-4 py-3 rounded-lg bg-white/5 text-gray-300 font-medium cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
            Ayarlar
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </div>

      {/* Client Component - Kampanya Listesi */}
      <CampaignsClient campaigns={campaigns} brandName={user.brandProfile.companyName} />
    </div>
  )
}
