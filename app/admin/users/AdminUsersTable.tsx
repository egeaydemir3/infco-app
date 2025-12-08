'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/format'

type AdminUser = {
  id: string
  email: string
  role: 'INFLUENCER' | 'BRAND'
  status: string
  createdAt: Date
  influencerProfile?: {
    displayName: string | null
    city: string | null
  } | null
  brandProfile?: {
    companyName: string | null
    website: string | null
  } | null
}

type AdminUsersTableProps = {
  users: AdminUser[]
}

export default function AdminUsersTable({ users }: AdminUsersTableProps) {
  const router = useRouter()
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (userId: string) => {
    setApprovingIds((prev) => new Set([...prev, userId]))
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        // Başarılı - sayfayı yenile
        router.refresh()
      } else {
        // Hata durumu
        setError(data.message || 'Onaylama sırasında bir hata oluştu')
        console.error('Approve error:', data)
      }
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar deneyin')
      console.error('Approve error:', err)
    } finally {
      setApprovingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  if (users.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
        <p className="text-gray-400 text-lg">Bekleyen kullanıcı bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
      {/* Hata Mesajı */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Email</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Rol</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">İsim</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Kayıt Tarihi</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isApproving = approvingIds.has(user.id)
              const displayName =
                user.role === 'INFLUENCER'
                  ? user.influencerProfile?.displayName || 'N/A'
                  : user.brandProfile?.companyName || 'N/A'

              return (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{user.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        user.role === 'INFLUENCER'
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border-purple-500/40'
                          : 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {user.role === 'INFLUENCER' ? 'Influencer' : 'Brand'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{displayName}</p>
                    {user.role === 'BRAND' && user.brandProfile?.website && (
                      <p className="text-gray-400 text-xs">{user.brandProfile.website}</p>
                    )}
                    {user.role === 'INFLUENCER' && user.influencerProfile?.city && (
                      <p className="text-gray-400 text-xs">{user.influencerProfile.city}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{formatDate(user.createdAt)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={isApproving}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isApproving
                          ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105'
                      }`}
                    >
                      {isApproving ? 'Onaylanıyor...' : 'Onayla'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

