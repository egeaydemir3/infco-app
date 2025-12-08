import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DemographicsCharts from './DemographicsCharts'
import LogoutButton from '@/components/LogoutButton'
import AccessDenied from '@/components/AccessDenied'
import BrandCampaignInfluencersClient from '../BrandCampaignInfluencersClient'
import { formatCurrency, formatNumber } from '@/lib/format'

type PageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string }
}

export default async function CampaignApplicationsPage({ params }: PageProps) {
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

  // Kampanyayı bul ve brand kontrolü yap (findFirst ile hem id hem brandId kontrolü)
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
    },
  })

  if (!campaign) {
    notFound()
  }

  // Bu kampanyaya başvuran influencer'ları ve içeriklerini çek
  const applications = await prisma.campaignApplication.findMany({
    where: {
      campaignId: campaignId,
    },
    include: {
      influencer: {
        include: {
          user: {
            select: {
              email: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Her influencer için ER hesapla (sadece APPROVED içerikler)
  // ÖNCE applicationsWithMetrics tanımlanmalı, sonra kullanılmalı
  const applicationsWithMetrics = applications.map((application: typeof applications[0]) => {
    const allContents = application.contents
    const approvedContents = allContents.filter((c) => c.status === 'APPROVED')
    
    const totalViews = approvedContents.reduce((sum, c) => sum + (c.views || 0), 0)
    const totalLikes = approvedContents.reduce((sum, c) => sum + (c.likes || 0), 0)
    const totalComments = approvedContents.reduce((sum, c) => sum + (c.comments || 0), 0)
    const totalShares = approvedContents.reduce((sum, c) => sum + (c.shares || 0), 0)
    const totalInteractions = totalLikes + totalComments + totalShares
    const er = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0

    return {
      ...application,
      contents: allContents, // Tüm içerikleri sakla (UI'da göstermek için)
      approvedContents, // APPROVED içerikleri ayrı sakla
      metrics: {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        totalInteractions,
        er,
        contentCount: allContents.length, // Toplam içerik sayısı (tüm statusler)
        approvedContentCount: approvedContents.length, // APPROVED içerik sayısı
      },
    }
  })

  // Demografik özet hesapla (sadece APPROVED içerikleri olan influencer'lar)
  const demographics = {
    gender: {
      MALE: 0,
      FEMALE: 0,
      OTHER: 0,
      unknown: 0,
    },
    ageRange: {
      '13-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35+': 0,
      unknown: 0,
    },
    interests: {} as Record<string, number>,
  }

  // Sadece APPROVED içerikleri olan influencer'ları say
  applicationsWithMetrics.forEach((application) => {
    // Eğer bu influencer'ın APPROVED içeriği yoksa demografik özete dahil etme
    if (application.metrics.approvedContentCount === 0) {
      return
    }

    const profile = application.influencer

    // Gender
    if (profile.gender) {
      if (profile.gender === 'MALE' || profile.gender === 'FEMALE' || profile.gender === 'OTHER') {
        demographics.gender[profile.gender]++
      } else {
        demographics.gender.unknown++
      }
    } else {
      demographics.gender.unknown++
    }

    // Age Range
    if (profile.ageRange) {
      if (['13-17', '18-24', '25-34', '35+'].includes(profile.ageRange)) {
        demographics.ageRange[profile.ageRange as keyof typeof demographics.ageRange]++
      } else {
        demographics.ageRange.unknown++
      }
    } else {
      demographics.ageRange.unknown++
    }

    // Interests
    if (profile.interests) {
      const interestList = profile.interests.split(',').map((i) => i.trim())
      interestList.forEach((interest) => {
        if (interest) {
          demographics.interests[interest] = (demographics.interests[interest] || 0) + 1
        }
      })
    }
  })

  // Kampanya performans metrikleri (sadece APPROVED içerikler)
  const totalApplications = applications.length

  // Tüm içeriklerden sadece APPROVED olanları filtrele
  const allApprovedContents = applications.flatMap((app) =>
    app.contents.filter((c) => c.status === 'APPROVED')
  )

  // İçerik yüklemiş başvuru sayısı (en az bir APPROVED içerik olan)
  const applicationsWithApprovedContent = applications.filter((app) =>
    app.contents.some((c) => c.status === 'APPROVED')
  )
  const approvedContentCount = allApprovedContents.length

  // Toplam views (sadece APPROVED content'lerdeki views toplamı)
  const totalViews = allApprovedContents.reduce((sum, content) => {
    return sum + (content.views || 0)
  }, 0)

  // Ortalama ER (view bazlı, sadece APPROVED içerikler)
  const erValues = allApprovedContents
    .map((content) => {
      const likes = content.likes ?? 0
      const comments = content.comments ?? 0
      const shares = content.shares ?? 0
      const views = content.views ?? 0
      if (!views || views <= 0) return 0
      return ((likes + comments + shares) / views) * 100
    })
    .filter((er) => er > 0)

  const averageEr = erValues.length > 0 ? erValues.reduce((sum, v) => sum + v, 0) / erValues.length : 0

  // Tahmini toplam ödeme (sadece APPROVED içerikler)
  const pricePerView = campaign.pricePerView ?? 0
  const estimatedPayout = pricePerView * totalViews

  // Toplam kazanç (APPROVED içeriklerin earning toplamı)
  const totalEarnings = allApprovedContents.reduce((sum, content) => {
    return sum + (content.earning || 0)
  }, 0)

  // Kalan bütçe
  const remainingBudget = campaign.totalPool - totalEarnings

  // Influencer bazlı performans dizisi oluştur (sadece APPROVED içerikler)
  const influencerPerformances = applicationsWithMetrics
    .filter((app) => app.metrics.approvedContentCount > 0) // Sadece APPROVED içeriği olanlar
    .map((application) => {
      const influencer = application.influencer
      const approvedContents = application.approvedContents

      return {
        id: application.influencer.id,
        influencerId: application.influencer.id,
        name: influencer.displayName || influencer.user.email,
        email: influencer.user.email,
        category: influencer.category,
        followerCount: influencer.followerCount,
        totalViews: application.metrics.totalViews,
        totalEarning: approvedContents.reduce((sum, c) => sum + (c.earning || 0), 0),
        avgER: application.metrics.er,
        contentCount: application.metrics.approvedContentCount,
        totalInteractions: application.metrics.totalInteractions,
        contents: approvedContents.map((c) => ({
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

      {/* SAĞ SÜTUN - İçerik */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Geri Dön Butonu */}
          <Link
            href="/brand/campaigns"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kampanyalara Dön
          </Link>

          {/* Kampanya Bilgisi */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">{campaign.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Platform</p>
                <p className="text-white font-semibold">{campaign.platform}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Toplam Bütçe</p>
                <p className="text-white font-semibold">
                  {formatCurrency(campaign.totalPool)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Durum</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                    campaign.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : campaign.status === 'ENDED'
                        ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {campaign.status === 'ACTIVE' ? 'Aktif' : campaign.status === 'ENDED' ? 'Bitti' : 'Taslak'}
                </span>
              </div>
            </div>
          </div>

          {/* Kampanya Performans Özeti */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Toplam Başvuru */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Toplam Başvuru</p>
              <p className="text-white font-bold text-3xl">{totalApplications}</p>
              <p className="text-gray-500 text-xs mt-1">
                {approvedContentCount} onaylanmış içerik
              </p>
            </div>

            {/* Toplam İzlenme */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Toplam İzlenme</p>
              <p className="text-white font-bold text-3xl">{formatNumber(totalViews)}</p>
              <p className="text-gray-500 text-xs mt-1">Onaylanmış içerikler</p>
            </div>

            {/* Ortalama ER */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Ortalama ER</p>
              <p className="text-green-400 font-bold text-3xl">%{averageEr.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-1">View bazlı</p>
            </div>

            {/* Tahmini Ödeme */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-2">Toplam Ödeme</p>
              <p className="text-white font-bold text-3xl">
                {formatCurrency(totalEarnings)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Kalan: {formatCurrency(remainingBudget)}
              </p>
            </div>
          </div>

          {/* Demografik Özet - Grafikler */}
          {applicationsWithMetrics.length > 0 && (
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-6">Kampanya Demografik Özeti</h3>
              <DemographicsCharts
                gender={demographics.gender}
                ageRange={demographics.ageRange}
                interests={demographics.interests}
              />
            </div>
          )}

          {/* Başvurular Listesi */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Başvurular ({influencerPerformances.length})
            </h3>

            {influencerPerformances.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
                <p className="text-gray-400">Bu kampanyaya henüz başvuru yapılmamış veya onaylanmış içerik bulunmuyor.</p>
              </div>
            ) : (
              <BrandCampaignInfluencersClient influencerPerformances={influencerPerformances} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

