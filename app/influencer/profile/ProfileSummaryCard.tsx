import { formatNumber } from '@/lib/format'

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

type ProfileSummaryCardProps = {
  profile: InfluencerProfile
}

export default function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const getGenderLabel = (gender: string | null) => {
    if (!gender) return '—'
    switch (gender) {
      case 'MALE':
        return 'Erkek'
      case 'FEMALE':
        return 'Kadın'
      case 'OTHER':
        return 'Diğer'
      default:
        return gender
    }
  }

  const getCategoryLabel = (category: string | null) => {
    if (!category) return '—'
    const categories: Record<string, string> = {
      beauty: 'Beauty',
      fashion: 'Fashion',
      gaming: 'Gaming',
      lifestyle: 'Lifestyle',
      tech: 'Tech',
      food: 'Food',
      travel: 'Travel',
    }
    return categories[category] || category
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol Sütun - Temel Bilgiler */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400">Görünen İsim</label>
            <p className="text-white font-semibold mt-1">{profile.displayName || '—'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Şehir</label>
            <p className="text-white mt-1">{profile.city || '—'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Cinsiyet</label>
            <p className="text-white mt-1">{getGenderLabel(profile.gender)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Yaş Aralığı</label>
            <p className="text-white mt-1">{profile.ageRange || '—'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Ana Kategori</label>
            <p className="text-white mt-1">{getCategoryLabel(profile.category)}</p>
          </div>
        </div>

        {/* Sağ Sütun - Sosyal Medya */}
        <div className="space-y-4">
          {/* Sosyal Medya Metrikleri */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Sosyal Medya Takipçileri</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Instagram</span>
                <span className="text-white font-semibold">
                  {profile.instagramFollowers !== null && profile.instagramFollowers !== undefined
                    ? formatNumber(profile.instagramFollowers)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">TikTok</span>
                <span className="text-white font-semibold">
                  {profile.tiktokFollowers !== null && profile.tiktokFollowers !== undefined
                    ? formatNumber(profile.tiktokFollowers)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">YouTube</span>
                <span className="text-white font-semibold">
                  {profile.youtubeFollowers !== null && profile.youtubeFollowers !== undefined
                    ? formatNumber(profile.youtubeFollowers)
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Sosyal Medya Linkleri */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Sosyal Medya Linkleri</label>
            <div className="space-y-2">
              {profile.instagramUrl ? (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-400 hover:text-blue-300 text-sm transition-colors truncate"
                >
                  Instagram →
                </a>
              ) : (
                <span className="text-gray-500 text-sm">—</span>
              )}
              {profile.tiktokUrl ? (
                <a
                  href={profile.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-400 hover:text-blue-300 text-sm transition-colors truncate"
                >
                  TikTok →
                </a>
              ) : (
                <span className="text-gray-500 text-sm">—</span>
              )}
              {profile.youtubeUrl ? (
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-400 hover:text-blue-300 text-sm transition-colors truncate"
                >
                  YouTube →
                </a>
              ) : (
                <span className="text-gray-500 text-sm">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

