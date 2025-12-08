import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import AccessDenied from '@/components/AccessDenied'
import { formatDate, formatCurrency } from '@/lib/format'

export default async function BrandDashboard() {
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

  // Dashboard metriklerini hesapla
  const totalCampaigns = await prisma.campaign.count({
    where: { brandId: user.brandProfile.id },
  })

  const activeCampaigns = await prisma.campaign.count({
    where: { brandId: user.brandProfile.id, status: 'ACTIVE' },
  })

  // Toplam bütçe hesapla
  const campaigns = await prisma.campaign.findMany({
    where: { brandId: user.brandProfile.id },
    select: { totalPool: true },
  })

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.totalPool || 0), 0)

  // Toplam başvuru sayısı
  const totalApplications = await prisma.campaignApplication.count({
    where: {
      campaign: {
        brandId: user.brandProfile.id,
      },
    },
  })

  // Son kampanyalar (son 3)
  const recentCampaigns = await prisma.campaign.findMany({
    where: { brandId: user.brandProfile.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      status: true,
      platform: true,
      createdAt: true,
    },
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
      ENDED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Aktif',
      ENDED: 'Bitti',
      DRAFT: 'Taslak',
    }
    return labels[status] || status
  }

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
          <div className="px-4 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white">
            Dashboard
          </div>
          <Link
            href="/brand/campaigns"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Kampanyalarım
          </Link>
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

      {/* SAĞ SÜTUN - Dashboard İçeriği */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Başlık */}
          <h2 className="text-3xl font-bold text-white mb-8">Dashboard</h2>

          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Toplam Kampanya</p>
              <p className="text-white font-bold text-3xl">{totalCampaigns}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Aktif Kampanya</p>
              <p className="text-white font-bold text-3xl">{activeCampaigns}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Toplam Bütçe</p>
              <p className="text-white font-bold text-3xl">
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Toplam Başvuru</p>
              <p className="text-white font-bold text-3xl">{totalApplications}</p>
            </div>
          </div>

          {/* Son Kampanyalar */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Son Oluşturulan Kampanyalar</h3>
            {recentCampaigns.length === 0 ? (
              <p className="text-gray-400">Henüz kampanya oluşturulmamış.</p>
            ) : (
              <div className="space-y-3">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{campaign.title}</h4>
                      <div className="flex items-center gap-3">
                        <p className="text-gray-400 text-sm">
                          {formatDate(campaign.createdAt)}
                        </p>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30">
                          {campaign.platform}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
