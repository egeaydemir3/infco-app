import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import AccessDenied from '@/components/AccessDenied'
import CampaignTabs from './CampaignTabs'
import BrandCampaignInfluencersClient from './BrandCampaignInfluencersClient'

type PageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string }
}

export default async function CampaignDetailPage({ params }: PageProps) {
  // Oturum açan kullanıcıyı bul
  const user = await getCurrentUser()

  if (!user || !user.brandProfile || user.role !== 'BRAND') {
    return (
      <AccessDenied
        message="Bu alanı görmek için marka olarak giriş yapmalısınız."
        loginUrl="/auth/login?role=brand"
      />
    )
  }

  // Params'ı resolve et (Next.js 15'te Promise olabilir)
  const resolvedParams = await Promise.resolve(params)
  const campaignId = resolvedParams.campaignId

  // campaignId kontrolü
  if (!campaignId || typeof campaignId !== 'string') {
    notFound()
  }

  // Kampanyayı bul ve brand kontrolü yap
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      brandId: user.brandProfile.id,
    },
    include: {
      brand: {
        select: {
          id: true,
          companyName: true,
        },
      },
      contents: {
        include: {
          influencer: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!campaign) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-3xl font-black tracking-tighter mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              INFCO
            </span>
          </h1>
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Kampanya Bulunamadı</h2>
          <p className="text-gray-400 mb-6">
            Aradığınız kampanya bulunamadı veya bu kampanyaya erişim yetkiniz yok.
          </p>
          <Link
            href="/brand/campaigns"
            className="block w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
          >
            Kampanyalara Dön
          </Link>
        </div>
      </div>
    )
  }

  // Sadece APPROVED içerikleri filtrele
  const approvedContents = campaign.contents.filter((c) => c.status === 'APPROVED')

  // Influencer bazında grupla ve performans hesapla
  const influencerMap = new Map<
    string,
    {
      influencerId: string
      influencerName: string
      category: string
      followerCount: number
      contents: typeof approvedContents
    }
  >()

  approvedContents.forEach((content) => {
    const influencerId = content.influencer.id
    const influencer = content.influencer

    if (!influencerMap.has(influencerId)) {
      influencerMap.set(influencerId, {
        influencerId,
        influencerName: influencer.displayName || influencer.user.email,
        category: influencer.category,
        followerCount: influencer.followerCount,
        contents: [],
      })
    }

    influencerMap.get(influencerId)!.contents.push(content)
  })

  // Her influencer için performans metriklerini hesapla
  const influencerPerformances = Array.from(influencerMap.values()).map((data) => {
    const totalViews = data.contents.reduce((sum, c) => sum + (c.views || 0), 0)
    const totalEarning = data.contents.reduce((sum, c) => sum + (c.earning || 0), 0)
    const totalLikes = data.contents.reduce((sum, c) => sum + (c.likes || 0), 0)
    const totalComments = data.contents.reduce((sum, c) => sum + (c.comments || 0), 0)
    const totalShares = data.contents.reduce((sum, c) => sum + (c.shares || 0), 0)
    const totalInteractions = totalLikes + totalComments + totalShares

    // Ortalama ER hesapla
    const erValues = data.contents
      .map((content) => {
        const likes = content.likes ?? 0
        const comments = content.comments ?? 0
        const shares = content.shares ?? 0
        const views = content.views ?? 0
        if (!views || views <= 0) return 0
        return ((likes + comments + shares) / views) * 100
      })
      .filter((er) => er > 0)

    const avgER = erValues.length > 0 ? erValues.reduce((sum, v) => sum + v, 0) / erValues.length : 0

    // Influencer bilgilerini al (email için)
    const firstContent = data.contents[0]
    const influencer = firstContent.influencer

    return {
      id: data.influencerId,
      influencerId: data.influencerId,
      name: data.influencerName,
      email: influencer.user.email,
      category: data.category,
      followerCount: data.followerCount,
      totalViews,
      totalEarning,
      avgER,
      contentCount: data.contents.length,
      totalInteractions,
      contents: data.contents.map((c) => ({
        id: c.id,
        platform: c.platform,
        contentUrl: c.contentUrl,
        views: c.views ?? 0,
        earning: c.earning ?? 0,
        likes: c.likes ?? 0,
        comments: c.comments ?? 0,
        shares: c.shares ?? 0,
        status: c.status,
      })),
    }
  })

  // totalViews'e göre azalan sıralama
  influencerPerformances.sort((a, b) => b.totalViews - a.totalViews)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 border-r border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter mb-8">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              INFCO
            </span>
          </h1>
          <nav className="space-y-2">
            <Link
              href="/brand/dashboard"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/brand/campaigns"
              className="block px-4 py-2 rounded-lg bg-white/10 text-white font-semibold"
            >
              Kampanyalarım
            </Link>
            <Link
              href="/brand/campaigns/new"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Yeni Kampanya
            </Link>
            <Link
              href="/brand/campaigns"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Ayarlar
            </Link>
          </nav>
          <div className="mt-8">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Başlık ve geri dön butonu */}
          <div className="mb-8">
            <Link
              href="/brand/campaigns"
              className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Kampanyalara Dön
            </Link>
            <h1 className="text-4xl font-black tracking-tighter mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                INFCO
              </span>
            </h1>
            <h2 className="text-3xl font-bold text-white mb-2">{campaign.title}</h2>
            <p className="text-gray-400">{campaign.description || 'Kampanya detayları'}</p>
          </div>

          {/* Tab Component */}
          <CampaignTabs
            campaign={{
              ...campaign,
              maxCpm: campaign.maxCpm ?? 0,
              pricePerView: campaign.pricePerView,
            }}
            approvedContents={approvedContents}
            influencerPerformances={influencerPerformances}
          />

          {/* Başvurular Bölümü */}
          {influencerPerformances.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Başvurular ({influencerPerformances.length})
              </h3>
              <BrandCampaignInfluencersClient influencerPerformances={influencerPerformances} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

