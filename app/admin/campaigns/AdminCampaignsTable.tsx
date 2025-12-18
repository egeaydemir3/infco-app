'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/format'

type AdminCampaign = {
  id: string
  title: string
  description: string | null
  platform: string
  totalPool: number
  pricePer1000View: number
  maxCpm: number | null
  startDate: Date
  endDate: Date
  status: string
  brand: {
    companyName: string
  }
}

type AdminCampaignsTableProps = {
  campaigns: AdminCampaign[]
}

export default function AdminCampaignsTable({ campaigns }: AdminCampaignsTableProps) {
  const router = useRouter()
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (campaignId: string) => {
    setApprovingIds((prev) => new Set([...prev, campaignId]))
    setError(null)

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/approve`, {
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
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
        <p className="text-gray-400 text-lg">Bekleyen kampanya bulunmuyor.</p>
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
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Marka</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Kampanya</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Platform</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Toplam Bütçe</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">İzlenme Başı Ücret</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Max CPM</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Tarih Aralığı</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Durum</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const isApproving = approvingIds.has(campaign.id)
              return (
                <tr
                  key={campaign.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="text-white font-semibold">{campaign.brand.companyName}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{campaign.title}</p>
                      {campaign.description && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2 max-w-xs">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border border-blue-500/30">
                      {campaign.platform}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{formatCurrency(campaign.totalPool)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">${campaign.pricePer1000View.toFixed(2)} / 1000 izlenme</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">
                      {campaign.maxCpm ? formatCurrency(campaign.maxCpm) : '–'}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-gray-300 text-sm">{formatDate(campaign.startDate)}</p>
                      <p className="text-gray-400 text-xs">-</p>
                      <p className="text-gray-300 text-sm">{formatDate(campaign.endDate)}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-orange-500/20 text-orange-300 border-orange-500/40">
                      İncelemede
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleApprove(campaign.id)}
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

