'use client'

import { useState } from 'react'
import { formatDate, formatCurrency, formatNumber } from '@/lib/format'

type Application = {
  id: string
  status: string
  createdAt: Date
  campaign: {
    id: string
    title: string
    platform: string
    pricePer1000View: number
    brand: {
      companyName: string
    }
  }
  contents: Array<{
    id: string
    views: number | null
    status: string
    earning: number
  }>
}

type ApplicationsClientProps = {
  applications: Application[]
}

export default function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    platform: string
    videoUrl: string
    publishDate: string
    likes: number | ''
    comments: number | ''
    shares: number | ''
    followers: number | ''
    views: number | ''
  }>({
    platform: 'Instagram',
    videoUrl: '',
    publishDate: '',
    likes: '',
    comments: '',
    shares: '',
    followers: '',
    views: '',
  })

  const selectedApplication = selectedApplicationId
    ? applications.find((app) => app.id === selectedApplicationId)
    : null

  const handleAddContent = (applicationId: string) => {
    // Formu sıfırla
    setFormData({
      platform: 'Instagram',
      videoUrl: '',
      publishDate: '',
      likes: '',
      comments: '',
      shares: '',
      followers: '',
      views: '',
    })
    setError(null)
    setSelectedApplicationId(applicationId)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedApplicationId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedApplication) {
      setError('Başvuru bulunamadı')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Numeric alanları number veya null olarak hazırla
      const likesNum = typeof formData.likes === 'number' ? formData.likes : null
      const commentsNum = typeof formData.comments === 'number' ? formData.comments : null
      const sharesNum = typeof formData.shares === 'number' ? formData.shares : null
      const followersNum = typeof formData.followers === 'number' ? formData.followers : null
      const viewsNum = typeof formData.views === 'number' ? formData.views : null

      // Tarihi ISO string'e çevir
      const postedAtDate = formData.publishDate ? new Date(formData.publishDate).toISOString() : null

      if (!postedAtDate) {
        setError('Yayın tarihi gereklidir')
        setIsSaving(false)
        return
      }

      // API'ye POST isteği at
      const response = await fetch('/api/influencer/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: selectedApplication.campaign.id,
          campaignApplicationId: selectedApplication.id,
          platform: formData.platform,
          contentUrl: formData.videoUrl,
          postedAt: postedAtDate,
          likes: likesNum,
          comments: commentsNum,
          shares: sharesNum,
          followers: followersNum,
          views: viewsNum,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Başarılı
        if (data.earning !== undefined) {
          console.log('Saved content earning:', data.earning)
        }
        if (data.content?.status) {
          console.log('Content status:', data.content.status)
        }
        alert('İçerik kaydedildi')
        // Sayfayı yenile (kazancı ve status'ü göstermek için)
        window.location.reload()
        handleClosePanel()
      } else {
        // Hata durumu
        const errorMessage = data.message || 'İçerik kaydedilirken bir hata oluştu'
        setError(errorMessage)
        console.warn('Content save warning:', data)
      }
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar deneyin')
      console.error('Content save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Eğer başvuru yoksa
  if (applications.length === 0) {
    return (
      <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Aktif Kampanyalarım</h2>
          <p className="text-gray-400">Henüz başvuru yapılmış kampanya bulunmamaktadır.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ORTA SÜTUN - Başvuru Listesi */}
      <div className={`relative z-10 flex-1 overflow-y-auto transition-all duration-300 ${isPanelOpen ? 'mr-96' : ''}`}>
        <div className="p-8">
          {/* Başlık */}
          <h2 className="text-3xl font-bold text-white mb-8">Aktif Kampanyalarım</h2>

          {/* Başvuru Kartları */}
          <div className="space-y-4">
            {applications.map((application) => {
              // İçerik varsa ilk içeriği al (en son eklenen)
              const latestContent = application.contents.length > 0 ? application.contents[0] : null
              
              // Tahmini kazanç: content varsa earning'ini kullan, yoksa hesapla
              const estimatedEarning = latestContent
                ? latestContent.earning
                : 0

              // Durum badge'i
              const getStatusBadge = (status: string | null) => {
                if (!status) {
                  return {
                    text: 'Aktif',
                    className: 'bg-green-500/20 text-green-400 border-green-500/30',
                  }
                }
                switch (status) {
                  case 'PENDING':
                    return {
                      text: 'Beklemede',
                      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                    }
                  case 'APPROVED':
                    return {
                      text: 'Onaylandı',
                      className: 'bg-green-500/20 text-green-400 border-green-500/30',
                    }
                  case 'REJECTED':
                    return {
                      text: 'Reddedildi',
                      className: 'bg-red-500/20 text-red-400 border-red-500/30',
                    }
                  default:
                    return {
                      text: 'Aktif',
                      className: 'bg-green-500/20 text-green-400 border-green-500/30',
                    }
                }
              }

              const statusBadge = getStatusBadge(latestContent?.status || null)

              return (
                <div
                  key={application.id}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    {/* Sol Taraf - Bilgiler */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{application.campaign.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{application.campaign.brand.companyName}</p>
                      <p className="text-gray-400 text-sm mb-2">
                        Platform: {application.campaign.platform}
                      </p>
                      <p className="text-green-400 font-semibold">
                        Tahmini Kazanç: {latestContent ? formatCurrency(estimatedEarning) : '$0.00'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Başvuru Tarihi: {formatDate(application.createdAt)}
                      </p>
                    </div>

                    {/* Sağ Taraf - Buton */}
                    <button
                      onClick={() => handleAddContent(application.id)}
                      className="ml-4 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-105 whitespace-nowrap"
                    >
                      İçerik Ekle
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* SAĞ SÜTUN - İçerik Ekleme Paneli */}
      {isPanelOpen && selectedApplication && (
        <div className="relative z-20 w-96 bg-white/5 backdrop-blur-md border-l border-white/10 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="p-6">
            {/* Panel Başlığı ve Kapat Butonu */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">İçerik Ekle</h3>
              <button
                onClick={handleClosePanel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
            </div>

            {/* Kampanya Bilgisi */}
            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Kampanya</p>
              <p className="text-white font-semibold">{selectedApplication.campaign.title}</p>
              <p className="text-gray-400 text-sm mt-1">{selectedApplication.campaign.brand.companyName}</p>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Platform Seçimi */}
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitch">Twitch</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>

              {/* Video URL */}
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://..."
                />
              </div>

              {/* Yayın Tarihi */}
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Yayın Tarihi
                </label>
                <input
                  type="date"
                  id="publishDate"
                  name="publishDate"
                  required
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Engagement Metrikleri */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-gray-300 mb-4">Etkileşim Metrikleri</h4>
                
                {/* Beğeni */}
                <div className="mb-4">
                  <label htmlFor="likes" className="block text-sm font-medium text-gray-300 mb-2">
                    Beğeni
                  </label>
                  <input
                    type="number"
                    id="likes"
                    name="likes"
                    min="0"
                    value={formData.likes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        likes: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Yorum */}
                <div className="mb-4">
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-300 mb-2">
                    Yorum
                  </label>
                  <input
                    type="number"
                    id="comments"
                    name="comments"
                    min="0"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        comments: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Paylaşım */}
                <div className="mb-4">
                  <label htmlFor="shares" className="block text-sm font-medium text-gray-300 mb-2">
                    Paylaşım
                  </label>
                  <input
                    type="number"
                    id="shares"
                    name="shares"
                    min="0"
                    value={formData.shares}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shares: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Takipçi Sayısı */}
                <div className="mb-4">
                  <label htmlFor="followers" className="block text-sm font-medium text-gray-300 mb-2">
                    Takipçi Sayısı
                  </label>
                  <input
                    type="number"
                    id="followers"
                    name="followers"
                    min="0"
                    value={formData.followers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followers: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                {/* İzlenme */}
                <div className="mb-4">
                  <label htmlFor="views" className="block text-sm font-medium text-gray-300 mb-2">
                    İzlenme
                  </label>
                  <input
                    type="number"
                    id="views"
                    name="views"
                    min="0"
                    value={formData.views}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        views: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Engagement Rate Gösterimi */}
                {(() => {
                  const likes = typeof formData.likes === 'number' ? formData.likes : 0
                  const comments = typeof formData.comments === 'number' ? formData.comments : 0
                  const shares = typeof formData.shares === 'number' ? formData.shares : 0
                  const views = typeof formData.views === 'number' ? formData.views : 0
                  const totalInteractions = likes + comments + shares
                  const er = views && views > 0 ? (totalInteractions / views) * 100 : 0

                  return (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Engagement Rate (View Bazlı):</span>
                        <span className="text-lg font-bold text-green-400">
                          %{er.toFixed(2)}
                        </span>
                      </div>
                      {views > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          {totalInteractions} etkileşim / {formatNumber(views)} izlenme
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Butonlar */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClosePanel}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

