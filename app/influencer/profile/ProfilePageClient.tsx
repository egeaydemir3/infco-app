'use client'

import { useState } from 'react'
import ProfileSummaryCard from './ProfileSummaryCard'
import ProfileEditModal from './ProfileEditModal'

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

type ProfilePageClientProps = {
  initialProfile: InfluencerProfile
}

export default function ProfilePageClient({ initialProfile }: ProfilePageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Profil Özeti */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Profil</h2>
        <p className="text-gray-400 mb-4">
          Profil bilgilerini markalarla paylaşmadan önce buradan kontrol edebilirsin.
        </p>
        <ProfileSummaryCard profile={initialProfile} />

        {/* Profili Düzenle Butonu */}
        <div className="mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105"
          >
            Profili Düzenle
          </button>
        </div>
      </div>

      {/* Modal */}
      <ProfileEditModal
        initialProfile={initialProfile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

