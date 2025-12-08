'use client'

import { useState } from 'react'
import InfluencerProfileForm from './InfluencerProfileForm'

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

type ProfileEditModalProps = {
  initialProfile: InfluencerProfile
  isOpen: boolean
  onClose: () => void
}

export default function ProfileEditModal({ initialProfile, isOpen, onClose }: ProfileEditModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
          {/* Kapat Butonu */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 z-10"
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

          {/* Modal İçeriği */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Profilini Güncelle</h2>
            <p className="text-gray-400 mb-6">Bilgilerini güncelledikten sonra Kaydet'e basmayı unutma.</p>
            <InfluencerProfileForm initialProfile={initialProfile} onSuccess={onClose} />
          </div>
        </div>
      </div>
    </>
  )
}

