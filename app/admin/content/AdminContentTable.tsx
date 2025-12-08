'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatCurrency, formatNumber } from '@/lib/format'

type Content = {
  id: string
  contentUrl: string
  earning: number
  views: number | null
  createdAt: Date
  campaign: {
    id: string
    title: string
    platform: string
  }
  influencer: {
    displayName: string
    user: {
      email: string
    }
  }
}

type AdminContentTableProps = {
  contents: Content[]
}

export default function AdminContentTable({ contents }: AdminContentTableProps) {
  const router = useRouter()
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (contentId: string) => {
    setApprovingIds((prev) => new Set([...prev, contentId]))
    setError(null)

    try {
      const response = await fetch(`/api/admin/content/${contentId}/approve`, {
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
        newSet.delete(contentId)
        return newSet
      })
    }
  }

  if (contents.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
        <p className="text-gray-400 text-lg">Bekleyen içerik bulunmuyor.</p>
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
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Influencer</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Kampanya</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Video</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">İzlenme</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Beklenen Kazanç</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Tarih</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Durum</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((content) => {
              const isApproving = approvingIds.has(content.id)
              return (
                <tr
                  key={content.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-semibold">{content.influencer.displayName}</p>
                      <p className="text-gray-400 text-xs">{content.influencer.user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{content.campaign.title}</p>
                      <p className="text-gray-400 text-xs">{content.campaign.platform}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={content.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm underline truncate block max-w-xs"
                    >
                      {content.contentUrl}
                    </a>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{formatNumber(content.views ?? 0)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-green-400 font-semibold">{formatCurrency(content.earning)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{formatDate(content.createdAt)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Beklemede
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleApprove(content.id)}
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

