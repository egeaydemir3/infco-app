'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type InfluencerProfile = {
  id: string
  userId: string
  displayName: string
  bio: string | null
  category: string | null
  followerCount: number | null
  country: string | null
  gender: string | null
  ageRange: string | null
  interests: string | null
  city: string | null
  instagramFollowers: number | null
  tiktokFollowers: number | null
  youtubeFollowers: number | null
  instagramUrl: string | null
  tiktokUrl: string | null
  youtubeUrl: string | null
  createdAt: Date
  updatedAt: Date
}

type InfluencerProfileFormProps = {
  initialProfile: InfluencerProfile
  onSuccess?: () => void
}

export default function InfluencerProfileForm({ initialProfile, onSuccess }: InfluencerProfileFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    displayName: initialProfile.displayName || '',
    city: initialProfile.city || '',
    gender: initialProfile.gender || '',
    ageRange: initialProfile.ageRange || '',
    category: initialProfile.category || '',
    instagramFollowers: initialProfile.instagramFollowers !== null && initialProfile.instagramFollowers !== undefined ? initialProfile.instagramFollowers : '',
    tiktokFollowers: initialProfile.tiktokFollowers !== null && initialProfile.tiktokFollowers !== undefined ? initialProfile.tiktokFollowers : '',
    youtubeFollowers: initialProfile.youtubeFollowers !== null && initialProfile.youtubeFollowers !== undefined ? initialProfile.youtubeFollowers : '',
    instagramUrl: initialProfile.instagramUrl || '',
    tiktokUrl: initialProfile.tiktokUrl || '',
    youtubeUrl: initialProfile.youtubeUrl || '',
  })

  // initialProfile değiştiğinde formData'yı güncelle
  useEffect(() => {
    setFormData({
      displayName: initialProfile.displayName || '',
      city: initialProfile.city || '',
      gender: initialProfile.gender || '',
      ageRange: initialProfile.ageRange || '',
      category: initialProfile.category || '',
      instagramFollowers: initialProfile.instagramFollowers !== null && initialProfile.instagramFollowers !== undefined ? initialProfile.instagramFollowers : '',
      tiktokFollowers: initialProfile.tiktokFollowers !== null && initialProfile.tiktokFollowers !== undefined ? initialProfile.tiktokFollowers : '',
      youtubeFollowers: initialProfile.youtubeFollowers !== null && initialProfile.youtubeFollowers !== undefined ? initialProfile.youtubeFollowers : '',
      instagramUrl: initialProfile.instagramUrl || '',
      tiktokUrl: initialProfile.tiktokUrl || '',
      youtubeUrl: initialProfile.youtubeUrl || '',
    })
  }, [initialProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/influencer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          city: formData.city.trim() || null,
          gender: formData.gender || null,
          ageRange: formData.ageRange || null,
          category: formData.category.trim() || null,
          instagramFollowers: formData.instagramFollowers ? Number(formData.instagramFollowers) : null,
          tiktokFollowers: formData.tiktokFollowers ? Number(formData.tiktokFollowers) : null,
          youtubeFollowers: formData.youtubeFollowers ? Number(formData.youtubeFollowers) : null,
          instagramUrl: formData.instagramUrl.trim() || null,
          tiktokUrl: formData.tiktokUrl.trim() || null,
          youtubeUrl: formData.youtubeUrl.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          }
          window.location.reload()
        }, 1000)
      } else {
        setError(data.message || 'Profil güncellenirken bir hata oluştu')
      }
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Başarı Mesajı */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
          Profil başarıyla güncellendi!
        </div>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Ana Bilgiler Kartı */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Ana Bilgiler</h3>
        <div className="space-y-4">
          {/* Görünen İsim */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
              Görünen İsim <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="displayName"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Örn: Ayşe Yılmaz"
            />
          </div>

          {/* Şehir */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
              Şehir <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Örn: İstanbul"
            />
          </div>

          {/* Cinsiyet */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">
              Cinsiyet <span className="text-red-400">*</span>
            </label>
            <select
              id="gender"
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Seçiniz</option>
              <option value="MALE">Erkek</option>
              <option value="FEMALE">Kadın</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>

          {/* Yaş Aralığı */}
          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-gray-300 mb-2">
              Yaş Aralığı <span className="text-red-400">*</span>
            </label>
            <select
              id="ageRange"
              required
              value={formData.ageRange}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Seçiniz</option>
              <option value="13-17">13-17</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35+">35+</option>
            </select>
          </div>

          {/* Ana Kategori */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Ana Kategori <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Seçiniz</option>
              <option value="beauty">Beauty</option>
              <option value="fashion">Fashion</option>
              <option value="gaming">Gaming</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="tech">Tech</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sosyal Medya Metrikleri Kartı */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Sosyal Medya Metrikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Instagram Takipçi */}
          <div>
            <label htmlFor="instagramFollowers" className="block text-sm font-medium text-gray-300 mb-2">
              Instagram Takipçi
            </label>
            <input
              type="number"
              id="instagramFollowers"
              min="0"
              value={formData.instagramFollowers}
              onChange={(e) => setFormData({ ...formData, instagramFollowers: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>

          {/* TikTok Takipçi */}
          <div>
            <label htmlFor="tiktokFollowers" className="block text-sm font-medium text-gray-300 mb-2">
              TikTok Takipçi
            </label>
            <input
              type="number"
              id="tiktokFollowers"
              min="0"
              value={formData.tiktokFollowers}
              onChange={(e) => setFormData({ ...formData, tiktokFollowers: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>

          {/* YouTube Takipçi */}
          <div>
            <label htmlFor="youtubeFollowers" className="block text-sm font-medium text-gray-300 mb-2">
              YouTube Takipçi
            </label>
            <input
              type="number"
              id="youtubeFollowers"
              min="0"
              value={formData.youtubeFollowers}
              onChange={(e) => setFormData({ ...formData, youtubeFollowers: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Sosyal Medya Linkleri Kartı */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Sosyal Medya Linkleri</h3>
        <div className="space-y-4">
          {/* Instagram URL */}
          <div>
            <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Instagram Linki
            </label>
            <input
              type="url"
              id="instagramUrl"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://instagram.com/..."
            />
          </div>

          {/* TikTok URL */}
          <div>
            <label htmlFor="tiktokUrl" className="block text-sm font-medium text-gray-300 mb-2">
              TikTok Linki
            </label>
            <input
              type="url"
              id="tiktokUrl"
              value={formData.tiktokUrl}
              onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://tiktok.com/@..."
            />
          </div>

          {/* YouTube URL */}
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300 mb-2">
              YouTube Linki
            </label>
            <input
              type="url"
              id="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://youtube.com/@..."
            />
          </div>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? 'Kaydediliyor...' : 'Profili Kaydet'}
        </button>
      </div>
    </form>
  )
}

