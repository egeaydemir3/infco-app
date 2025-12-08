import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import AccessDenied from '@/components/AccessDenied'
import ProfilePageClient from './ProfilePageClient'

export default async function InfluencerProfilePage() {
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

  // Influencer profile'ı çek
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: user.id },
  })

  // Eğer profile yoksa (çok nadir durum), boş bir obje oluştur
  // Eğer profile varsa, tüm alanları doğru şekilde map et
  const initialProfile = profile
    ? {
        id: profile.id,
        userId: profile.userId,
        displayName: profile.displayName || '',
        bio: profile.bio,
        category: profile.category,
        followerCount: profile.followerCount,
        country: profile.country,
        gender: profile.gender,
        ageRange: profile.ageRange,
        interests: profile.interests,
        city: profile.city,
        instagramFollowers: profile.instagramFollowers,
        tiktokFollowers: profile.tiktokFollowers,
        youtubeFollowers: profile.youtubeFollowers,
        instagramUrl: profile.instagramUrl,
        tiktokUrl: profile.tiktokUrl,
        youtubeUrl: profile.youtubeUrl,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    : {
        id: '',
        userId: user.id,
        displayName: '',
        bio: null,
        category: null,
        followerCount: null,
        country: null,
        gender: null,
        ageRange: null,
        interests: null,
        city: null,
        instagramFollowers: null,
        tiktokFollowers: null,
        youtubeFollowers: null,
        instagramUrl: null,
        tiktokUrl: null,
        youtubeUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
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
          <Link
            href="/influencer/profile"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white"
          >
            Profil
          </Link>
          <Link
            href="/influencer/campaigns"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
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

      {/* ORTA SÜTUN - Profil Özeti ve Formu */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          {/* INFCO Başlığı */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tighter mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                INFCO
              </span>
            </h1>
          </div>

          {/* Client Component - Profil Özeti ve Modal */}
          <ProfilePageClient initialProfile={initialProfile} />
        </div>
      </div>
    </div>
  )
}

