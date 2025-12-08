import prisma from '@/lib/prisma'
import Link from 'next/link'
import CampaignsClient from './CampaignsClient'
import LogoutButton from '@/components/LogoutButton'
import { getCurrentUser } from '@/lib/auth'
import AccessDenied from '@/components/AccessDenied'

export default async function CampaignsPage() {
  // Oturum açan kullanıcıyı kontrol et
  const user = await getCurrentUser()
  
  // Eğer user yoksa veya role INFLUENCER değilse erişim reddedildi
  if (!user || user.role !== 'INFLUENCER') {
    return (
      <AccessDenied
        message="Bu alanı görmek için influencer olarak giriş yapmalısınız."
        loginUrl="/auth/login?role=influencer"
      />
    )
  }

  // Prisma'dan ACTIVE kampanyaları çek (brand bilgisiyle birlikte, contents dahil)
  // ÖNEMLİ: contents sadece status: 'APPROVED' ile filtreleniyor, influencerId filtresi YOK
  // Bu sayede kampanya doluluk oranı GLOBAL olarak hesaplanır (tüm influencer'ların içerikleri dahil)
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      brand: {
        select: {
          companyName: true,
        },
      },
      contents: {
        where: {
          status: 'APPROVED',
          // influencerId filtresi YOK - tüm APPROVED içerikler dahil edilir
        },
        select: {
          earning: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Her kampanya için bütçe doluluk bilgisini hesapla
  // ÖNEMLİ: spentBudget kampanyadaki TÜM APPROVED içeriklerden hesaplanır (global)
  // Bu sayede her influencer aynı doluluk oranını görür
  const campaignsWithBudget = campaigns.map((campaign) => {
    // Tüm APPROVED içeriklerin earning toplamı (influencerId filtresi yok)
    const approvedContents = campaign.contents.filter(
      (c) => c.earning !== null && c.earning !== undefined
    )
    const spentBudget = approvedContents.reduce(
      (sum, content) => sum + (content.earning ?? 0),
      0
    )
    const progressPercent =
      campaign.totalPool > 0
        ? Math.min(100, (spentBudget / campaign.totalPool) * 100)
        : 0

    return {
      ...campaign,
      spentBudget,
      progressPercent: Math.round(progressPercent),
    }
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
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white"
          >
            Kampanyaları Keşfet
          </Link>
          <Link
            href="/influencer/applications"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Aktif Kampanyalarım
          </Link>
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

      {/* Client Component - Kampanya Listesi ve Detay Paneli */}
      <CampaignsClient campaigns={campaignsWithBudget} />
    </div>
  )
}
