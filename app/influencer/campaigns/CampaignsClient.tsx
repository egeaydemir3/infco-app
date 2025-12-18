'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/format'

type Campaign = {
  id: string
  title: string
  description: string
  platform: string
  totalPool: number
  pricePer1000View: number
  status: string
  startDate: Date
  endDate: Date
  brand: {
    companyName: string
  }
  spentBudget?: number
  progressPercent?: number
}

type CampaignsClientProps = {
  campaigns: Campaign[]
}

export default function CampaignsClient({ campaigns }: CampaignsClientProps) {
  const router = useRouter()
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<string>>(new Set())
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<'ALL' | 'Instagram' | 'TikTok' | 'YouTube'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtreleme mantığı
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Platform filtresi
    if (platformFilter !== 'ALL' && campaign.platform !== platformFilter) {
      return false
    }

    // Arama sorgusu (kampanya adı veya marka adında)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim()
      const matchesTitle = campaign.title.toLowerCase().includes(query)
      const matchesBrand = campaign.brand.companyName.toLowerCase().includes(query)
      if (!matchesTitle && !matchesBrand) {
        return false
      }
    }

    return true
  })

  const selectedCampaign = selectedCampaignId
    ? filteredCampaigns.find((c) => c.id === selectedCampaignId) || null
    : null

  // Eğer seçili kampanya filtrelenmiş listede yoksa, seçimi sıfırla
  useEffect(() => {
    if (selectedCampaignId && !selectedCampaign) {
      setSelectedCampaignId(null)
    }
  }, [selectedCampaignId, selectedCampaign])

  const handleApply = async () => {
    if (!selectedCampaign) return

    // Eğer zaten başvuru yapıldıysa
    if (appliedCampaigns.has(selectedCampaign.id)) {
      alert('Bu kampanyaya zaten başvuru yaptınız.')
      return
    }

    setIsApplying(true)
    setError(null)

    try {
      const response = await fetch('/api/influencer/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Başarılı
        setAppliedCampaigns((prev) => new Set([...prev, selectedCampaign.id]))
        alert('Başvurunuz alındı!')
      } else {
        // Hata durumu
        if (data?.code === 'PROFILE_INCOMPLETE') {
          const errorMessage = 'Kampanyalara başvurmak için önce profilini tamamlaman gerekiyor.'
          setError(errorMessage)
          alert(errorMessage + '\n\nProfil sayfasına yönlendiriliyorsun...')
          // Profil sayfasına yönlendir
          router.push('/influencer/profile')
        } else {
          const errorMessage = data.message || 'Bir hata oluştu, lütfen tekrar deneyin.'
          setError(errorMessage)
          alert(errorMessage)
        }
      }
    } catch (error) {
      console.error('Error applying to campaign:', error)
      const errorMessage = 'Bir hata oluştu, lütfen tekrar deneyin.'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsApplying(false)
    }
  }

  // Eğer kampanya yoksa
  if (campaigns.length === 0) {
    return (
      <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Kampanya Bulunamadı</h2>
          <p className="text-gray-400">Şu anda aktif kampanya bulunmamaktadır.</p>
        </div>
      </div>
    )
  }

  // Platform badge renkleri
  const getPlatformBadgeStyle = (platform: string) => {
    const styles: Record<string, string> = {
      Instagram: 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border-purple-500/40',
      TikTok: 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border-cyan-500/40',
      YouTube: 'bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-300 border-red-500/40',
      Twitch: 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 border-purple-500/40',
    }
    return styles[platform] || 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border-blue-500/30'
  }

  // CPM hesaplama (1000 izlenme başına fiyat - zaten 1000 izlenme başına tutar)
  const calculateCPM = (pricePer1000View: number) => {
    return `1.000 izlenme / $${pricePer1000View.toFixed(2)}`
  }

  // Progress hesaplama (gerçek veri ile)
  const calculateProgress = (campaign: Campaign) => {
    // Eğer progressPercent prop olarak geliyorsa onu kullan
    if (campaign.progressPercent !== undefined) {
      return campaign.progressPercent
    }
    // Fallback: 0%
    return 0
  }

  return (
    <div className="flex flex-col sm:flex-row flex-1 min-h-0">
      {/* ORTA SÜTUN - Kampanya Listesi */}
      <div className={`relative z-10 overflow-y-auto ${selectedCampaign ? 'flex-1' : 'w-full'}`}>
        <div className={`p-4 sm:p-6 ${selectedCampaign ? '' : 'max-w-4xl mx-auto'}`}>
          {/* Başlık */}
          <h2 className="text-xl font-bold text-white mb-4">Kampanyalar</h2>

          {/* Filtre Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            {/* Platform Filtresi */}
            <div className="flex-shrink-0">
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as 'ALL' | 'Instagram' | 'TikTok' | 'YouTube')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer hover:bg-white/10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="ALL" className="bg-gray-900 text-white">Tümü</option>
                <option value="Instagram" className="bg-gray-900 text-white">Instagram</option>
                <option value="TikTok" className="bg-gray-900 text-white">TikTok</option>
                <option value="YouTube" className="bg-gray-900 text-white">YouTube</option>
              </select>
            </div>

            {/* Arama Kutusu */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kampanya veya marka ara…"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all hover:bg-white/10"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
                    aria-label="Temizle"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sonuç Sayısı */}
          {filteredCampaigns.length !== campaigns.length && (
            <div className="mb-4 text-sm text-gray-400">
              {filteredCampaigns.length} kampanya bulundu
            </div>
          )}

          {/* Kampanya Kartları */}
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">Filtreleme kriterlerinize uygun kampanya bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign) => {
              const progress = calculateProgress(campaign)
              const spentBudget = campaign.spentBudget ?? 0
              return (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaignId(campaign.id)}
                  className={`bg-white/5 backdrop-blur-md rounded-2xl border p-4 cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${
                    selectedCampaignId === campaign.id
                      ? 'border-indigo-500/50 bg-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)]'
                      : 'border-white/10 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:bg-white/10'
                  }`}
                >
                  {/* Üst Satır - Başlık ve Platform Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-0.5 truncate">{campaign.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{campaign.brand.companyName}</p>
                    </div>
                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getPlatformBadgeStyle(campaign.platform)}`}>
                      {campaign.platform}
                    </span>
                  </div>

                  {/* Orta Satır - Ödeme Bilgisi ve Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-gray-300 text-sm">
                        {formatCurrency(spentBudget)} / {formatCurrency(campaign.totalPool)}
                      </span>
                      <span className="text-sm text-emerald-400 font-semibold">%{progress}</span>
                    </div>
                    {/* İnce Progress Bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Alt Satır - Platform Info ve Buton */}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400">
                      {campaign.platform} • {calculateCPM(campaign.pricePer1000View)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCampaignId(campaign.id)
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-xs font-semibold hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all"
                    >
                      Detaylı İncele
                    </button>
                  </div>
                </div>
              )
            })}
            </div>
          )}
        </div>
      </div>

      {/* SAĞ SÜTUN - Detay Paneli (sadece seçili kampanya varsa render edilir) */}
      {selectedCampaign && (
        <div className="relative z-10 w-full sm:w-96 bg-white/5 backdrop-blur-md border-l-0 sm:border-l border-white/10 border-t sm:border-t-0 overflow-y-auto">
          <div className="p-4 sm:p-6 relative">
            {/* Kapat Butonu (X) */}
            <button
              onClick={() => setSelectedCampaignId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
              aria-label="Kapat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Marka ve Başlık */}
            <div className="mb-5">
              <p className="text-sm text-gray-400 mb-1">{selectedCampaign.brand.companyName}</p>
              <h2 className="text-2xl font-bold text-white">{selectedCampaign.title}</h2>
            </div>

            {/* Görsel Alanı (Placeholder) - KORUNDU */}
            <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 mb-5 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Kampanya Görseli</span>
            </div>

            {/* Maximum Ödeme Kartı */}
            <div className="mb-5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Maximum Ödeme</p>
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(selectedCampaign.totalPool)}
              </p>
            </div>

            {/* Platform + Tür Badge'leri ve CPV */}
            <div className="mb-5 space-y-3">
              {/* Platform ve Tür */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPlatformBadgeStyle(selectedCampaign.platform)}`}>
                  {selectedCampaign.platform}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300 border border-white/20">
                  Post
                </span>
              </div>
              {/* 1000 İzlenme Başına Ücret */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">1000 İzlenme Başına</p>
                <p className="text-lg text-emerald-400 font-semibold">
                  ${selectedCampaign.pricePer1000View.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Açıklama */}
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Açıklama</p>
              <div className="bg-white/5 rounded-2xl p-4 text-sm text-gray-200 leading-relaxed">
                {selectedCampaign.description}
              </div>
            </div>

            {/* Tarih Aralığı */}
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Tarih Aralığı</p>
              <p className="text-sm text-gray-300">
                {formatDate(selectedCampaign.startDate)} – {formatDate(selectedCampaign.endDate)}
              </p>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Başvur Butonu */}
            <button
              onClick={handleApply}
              disabled={isApplying || appliedCampaigns.has(selectedCampaign.id)}
              className={`w-full rounded-2xl py-3 font-bold text-white transition-all duration-300 ${
                appliedCampaigns.has(selectedCampaign.id)
                  ? 'bg-gray-600 cursor-not-allowed'
                  : isApplying
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]'
              }`}
            >
              {isApplying
                ? 'Başvuru Gönderiliyor...'
                : appliedCampaigns.has(selectedCampaign.id)
                ? 'Başvuruldu'
                : 'Başvur'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
