'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber } from '@/lib/format'

type Content = {
  id: string
  platform: string
  contentUrl: string
  views: number
  earning: number
  likes: number
  comments: number
  shares: number
  status: string
}

type InfluencerPerformance = {
  id: string
  influencerId: string
  name: string
  email: string
  category: string
  followerCount: number
  totalViews: number
  totalEarning: number
  avgER: number
  contentCount: number
  totalInteractions: number
  contents: Content[]
}

type BrandCampaignInfluencersClientProps = {
  influencerPerformances: InfluencerPerformance[]
}

export default function BrandCampaignInfluencersClient({
  influencerPerformances,
}: BrandCampaignInfluencersClientProps) {
  // Başlangıçta hiçbir influencer seçili değil
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = influencerPerformances.find((x) => x.id === selectedId)

  return (
    <div className="space-y-6">
      {/* Tablo */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Influencer</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Kategori</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Takipçi</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Toplam İzlenme</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Toplam Kazanç</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">Ortalama ER</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {influencerPerformances.map((perf) => {
                const isSelected = selectedId === perf.id
                return (
                  <tr
                    key={perf.id}
                    onClick={() => setSelectedId(perf.id)}
                    className={`border-b border-white/5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <p className="text-white font-semibold">{perf.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-300">{perf.category}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-white">{formatNumber(perf.followerCount)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">{formatNumber(perf.totalViews)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-green-400 font-semibold">{formatCurrency(perf.totalEarning)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-green-400 font-semibold">%{perf.avgER.toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(perf.id)
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Seçili' : 'Detay'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detay Panel */}
      {selected ? (
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative">
          {/* Kapat Butonu - Sağ Üst Köşe */}
          <button
            onClick={() => setSelectedId(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
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

          {/* Üst Bilgiler */}
          <div className="flex items-start justify-between mb-6 pr-10">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-2">{selected.name}</h4>
              <p className="text-gray-400 text-sm mb-1">Email: {selected.email}</p>
              <p className="text-gray-400 text-sm mb-1">Kategori: {selected.category}</p>
              <p className="text-gray-400 text-sm mb-1">Takipçi: {formatNumber(selected.followerCount)}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-500/20 text-green-400 border-green-500/30">
              Aktif
            </span>
          </div>

          {/* Metrikler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs mb-1">İçerik Sayısı</p>
              <p className="text-white font-bold text-lg">{selected.contentCount}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs mb-1">Toplam İzlenme</p>
              <p className="text-white font-bold text-lg">{formatNumber(selected.totalViews)}</p>
              <p className="text-gray-500 text-xs mt-1">Onaylanmış</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs mb-1">Toplam Etkileşim</p>
              <p className="text-white font-bold text-lg">{formatNumber(selected.totalInteractions)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs mb-1">Engagement Rate</p>
              <p className="text-green-400 font-bold text-lg">%{selected.avgER.toFixed(2)}</p>
            </div>
          </div>

          {/* Detaylı Metrikler */}
          {selected.contentCount > 0 && (
            <div className="pt-4 border-t border-white/10 mb-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Beğeni: </span>
                  <span className="text-white font-semibold">
                    {formatNumber(selected.contents.reduce((sum, c) => sum + c.likes, 0))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Yorum: </span>
                  <span className="text-white font-semibold">
                    {formatNumber(selected.contents.reduce((sum, c) => sum + c.comments, 0))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Paylaşım: </span>
                  <span className="text-white font-semibold">
                    {formatNumber(selected.contents.reduce((sum, c) => sum + c.shares, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* İçerik Listesi */}
          {selected.contents.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-3 font-semibold">İçerikler:</p>
              <div className="space-y-2">
                {selected.contents.map((content) => (
                  <div
                    key={content.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={content.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          {content.platform}
                        </a>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-green-500/20 text-green-400 border-green-500/30">
                          Onaylandı
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>
                          İzlenme:{' '}
                          <span className="text-white">{formatNumber(content.views)}</span>
                        </span>
                        <span>
                          Kazanç:{' '}
                          <span className="text-white">{formatCurrency(content.earning)}</span>
                        </span>
                        <span>
                          Beğeni:{' '}
                          <span className="text-white">{formatNumber(content.likes)}</span>
                        </span>
                        <span>
                          Yorum:{' '}
                          <span className="text-white">{formatNumber(content.comments)}</span>
                        </span>
                        <span>
                          Paylaşım:{' '}
                          <span className="text-white">{formatNumber(content.shares)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
          <p className="text-gray-400 text-lg">Detay görmek için yukarıdaki listeden bir influencer seçin.</p>
        </div>
      )}
    </div>
  )
}

