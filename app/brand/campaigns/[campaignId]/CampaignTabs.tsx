'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber } from '@/lib/format'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

type Content = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  platform: string
  contentUrl: string
  views: number | null
  earning: number
  influencer: {
    displayName: string
    user: {
      id: string
      email: string
    }
  }
}

type InfluencerPerformance = {
  id: string
  influencerId: string
  name: string
  email: string
  category: string | null
  followerCount: number | null
  totalViews: number
  totalEarning: number
  avgER: number
  contentCount: number
  totalInteractions: number
  contents: Array<{
    id: string
    platform: string
    contentUrl: string
    views: number
    earning: number
    likes: number
    comments: number
    shares: number
    status: string
  }>
}

type Campaign = {
  id: string
  title: string
  description: string | null
  maxCpm: number
  pricePerView: number
  contents: Content[]
}

type CampaignTabsProps = {
  campaign: Campaign
  approvedContents: Content[]
  influencerPerformances: InfluencerPerformance[]
}

export default function CampaignTabs({
  campaign,
  approvedContents,
  influencerPerformances,
}: CampaignTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contents' | 'influencers'>('overview')
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null)

  // Overview metrikleri hesapla
  const totalViews = approvedContents.reduce((sum, c) => sum + (c.views || 0), 0)
  const totalEarnings = approvedContents.reduce((sum, c) => sum + (c.earning || 0), 0)

  // Ortalama CPM hesapla
  const averageCpm = totalViews > 0 ? (totalEarnings / totalViews) * 1000 : 0

  // Tahmini Earnings (topViews * (pricePerView / 1000)) ama maxCpm'i aşarsa maxCpm'e eşitle
  const estimatedEarningsRaw = totalViews * (campaign.pricePerView / 1000)
  const estimatedEarnings = campaign.maxCpm > 0 && estimatedEarningsRaw > campaign.maxCpm
    ? campaign.maxCpm
    : estimatedEarningsRaw

  // Pie chart verileri (mock data - istenen değerler)
  const genderData = [
    { name: 'Erkek', value: 45 },
    { name: 'Kadın', value: 55 },
  ]

  const ageData = [
    { name: '18-24', value: 60 },
    { name: '25-34', value: 30 },
    { name: '35+', value: 10 },
  ]

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']

  const selectedInfluencer = selectedInfluencerId
    ? influencerPerformances.find((p) => p.id === selectedInfluencerId)
    : null

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-6 py-4 font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-white/10 text-white border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('contents')}
          className={`flex-1 px-6 py-4 font-semibold transition-all ${
            activeTab === 'contents'
              ? 'bg-white/10 text-white border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Contents
        </button>
        <button
          onClick={() => setActiveTab('influencers')}
          className={`flex-1 px-6 py-4 font-semibold transition-all ${
            activeTab === 'influencers'
              ? 'bg-white/10 text-white border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Influencers
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm mb-1">Toplam İzlenme</p>
                <p className="text-2xl font-bold text-white">{formatNumber(totalViews)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm mb-1">Ortalama CPM</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(averageCpm)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm mb-1">Max CPM</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(campaign.maxCpm)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm mb-1">Tahmini Earnings</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(estimatedEarnings)}</p>
              </div>
            </div>

            {/* Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Cinsiyet Dağılımı</h3>
                <PieChart width={300} height={250}>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                     label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Yaş Aralığı</h3>
                <PieChart width={300} height={250}>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                     label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>

            {/* Influencer Listesi */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Influencer Performansları</h3>
              <div className="space-y-2">
                {influencerPerformances.map((perf) => (
                  <div
                    key={perf.id}
                    onClick={() => setSelectedInfluencerId(perf.id === selectedInfluencerId ? null : perf.id)}
                    className={`bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer ${
                      selectedInfluencerId === perf.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Influencer</p>
                        <p className="text-white font-semibold">{perf.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Toplam Views</p>
                        <p className="text-white font-semibold">{formatNumber(perf.totalViews)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Toplam Kazanç</p>
                        <p className="text-white font-semibold">{formatCurrency(perf.totalEarning)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Ortalama ER</p>
                        <p className="text-white font-semibold">%{perf.avgER.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Kategori</p>
                        <p className="text-white font-semibold">{perf.category || '–'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seçili Influencer Detay Kutusu */}
            {selectedInfluencer && (
              <div className="relative bg-white/10 rounded-lg p-6 border border-white/20 mt-6">
                <button
                  onClick={() => setSelectedInfluencerId(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                >
                  ×
                </button>
                <h4 className="text-xl font-bold text-white mb-4">{selectedInfluencer.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedInfluencer.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Kategori</p>
                    <p className="text-white">{selectedInfluencer.category || '–'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Takipçi Sayısı</p>
                    <p className="text-white">{formatNumber(selectedInfluencer.followerCount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Toplam İçerik</p>
                    <p className="text-white">{selectedInfluencer.contentCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Toplam Views</p>
                    <p className="text-white">{formatNumber(selectedInfluencer.totalViews)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Toplam Kazanç</p>
                    <p className="text-white">{formatCurrency(selectedInfluencer.totalEarning)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Ortalama ER</p>
                    <p className="text-white">%{selectedInfluencer.avgER.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Toplam Etkileşim</p>
                    <p className="text-white">{formatNumber(selectedInfluencer.totalInteractions)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contents' && (
          <div>
            {campaign.contents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Henüz içerik eklenmemiş.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaign.contents.map((content) => {
                  const isApproved = content.status === 'APPROVED'
                  const isPending = content.status === 'PENDING'
                  const isRejected = content.status === 'REJECTED'

                  return (
                    <div
                      key={content.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <a
                              href={content.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-semibold underline"
                            >
                              {content.platform}
                            </a>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                isApproved
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : isPending
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}
                            >
                              {isApproved ? 'Onaylandı' : isPending ? 'Beklemede' : 'Reddedildi'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            Influencer: {content.influencer.displayName} ({content.influencer.user.email})
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">İzlenme: </span>
                          <span className="text-white font-semibold">
                            {isApproved ? formatNumber(content.views ?? 0) : '–'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Kazanç: </span>
                          <span className="text-white font-semibold">
                            {isApproved ? formatCurrency(content.earning ?? 0) : '–'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'influencers' && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Influencers section</p>
          </div>
        )}
      </div>
    </div>
  )
}
