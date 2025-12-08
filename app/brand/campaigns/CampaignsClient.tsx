'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/format'

type Campaign = {
  id: string
  title: string
  description: string
  platform: string
  totalPool: number
  pricePerView: number
  status: string
  startDate: Date
  endDate: Date
  createdAt: Date
}

type CampaignsClientProps = {
  campaigns: Campaign[]
  brandName: string
}

export default function CampaignsClient({ campaigns, brandName }: CampaignsClientProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
      ENDED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      PENDING_REVIEW: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Aktif',
      ENDED: 'Bitti',
      DRAFT: 'Taslak',
      PENDING_REVIEW: 'İncelemede',
    }
    return labels[status] || status
  }

  const handleEdit = (id: string) => {
    console.log('Kampanya düzenleme (mock)', id)
  }

  // Şimdilik harcanan miktarı 0 olarak göster (ileride gerçek veri ile güncellenebilir)
  const calculateSpentAmount = (campaign: Campaign) => {
    return 0 // Placeholder
  }

  return (
    <div className="relative z-10 flex-1 overflow-y-auto">
      <div className="p-8">
        {/* Başlık ve Yeni Kampanya Butonu */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Kampanyalarım</h2>
          <button
            onClick={() => router.push('/brand/campaigns/new')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105"
          >
            Yeni Kampanya Oluştur
          </button>
        </div>

        {/* Eğer kampanya yoksa */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">Henüz kampanya oluşturulmamış.</p>
            <button
              onClick={() => router.push('/brand/campaigns/new')}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105"
            >
              İlk Kampanyanı Oluştur
            </button>
          </div>
        ) : (
          /* Kampanya Kartları */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const spentAmount = calculateSpentAmount(campaign)
              const progress = campaign.totalPool > 0 ? Math.round((spentAmount / campaign.totalPool) * 100) : 0

              return (
                <div
                  key={campaign.id}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {/* Üst Satır - Başlık ve Durum */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white flex-1">{campaign.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>

                  {/* Orta Satır - Bütçe Bilgisi */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">
                        {formatCurrency(spentAmount)} / {formatCurrency(campaign.totalPool)} harcandı
                      </span>
                      <span className="text-gray-400 text-sm">{progress}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Alt Satır - Platform, Fiyat ve Tarih */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30">
                        {campaign.platform}
                      </span>
                      <span className="text-gray-400 text-xs">
                        ${campaign.pricePerView.toFixed(4)} / görüntüleme
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </p>
                  </div>

                  {/* Butonlar */}
                  <div className="flex gap-3 justify-between">
                    <Link
                      href={`/brand/campaigns/${campaign.id}/applications`}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600/50 to-emerald-600/50 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-center"
                    >
                      Başvuruları Gör
                    </Link>
                    <button
                      onClick={() => handleEdit(campaign.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

