'use client'

import { useState } from 'react'
import { formatDate, formatCurrency } from '@/lib/format'

interface WalletClientProps {
  wallet: {
    id: string
    balance: number
    transactions: Array<{
      id: string
      type: string
      amount: number
      relatedCampaignId: string | null
      createdAt: Date
    }>
  }
  pendingEarnings: number
}

export default function WalletClient({ wallet, pendingEarnings }: WalletClientProps) {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    iban: '',
  })

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Para çekme form verileri:', withdrawForm)
    setIsWithdrawModalOpen(false)
    setWithdrawForm({ amount: '', iban: '' })
  }

  // İstatistikleri hesapla
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const monthlyEarning = wallet.transactions
    .filter(
      (t) =>
        t.type === 'EARNING' &&
        new Date(t.createdAt) >= startOfMonth &&
        new Date(t.createdAt) <= now
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawn = wallet.transactions
    .filter((t) => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalEarning = wallet.transactions
    .filter((t) => t.type === 'EARNING')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <>
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Başlık ve Para Çek Butonu */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Cüzdanım</h2>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105"
            >
              Para Çek
            </button>
          </div>

          {/* Bakiye Özeti */}
          <div className="mb-8">
            {/* Ana Bakiye Kartı */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 mb-6">
              <p className="text-gray-400 text-sm mb-2">Toplam Bakiye</p>
              <p className="text-white font-bold text-5xl mb-6">
                {formatCurrency(wallet.balance)}
              </p>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <p className="text-gray-400 text-sm mb-2">Bu Ay Kazanılan</p>
                <p className="text-green-400 font-bold text-2xl">
                  {formatCurrency(monthlyEarning)}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <p className="text-gray-400 text-sm mb-2">Toplam Kazanç</p>
                <p className="text-green-400 font-bold text-2xl">
                  {formatCurrency(totalEarning)}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <p className="text-gray-400 text-sm mb-2">Bekleyen Kazanç</p>
                <p className="text-yellow-400 font-bold text-2xl">
                  {formatCurrency(pendingEarnings)}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <p className="text-gray-400 text-sm mb-2">Toplam Çekilen</p>
                <p className="text-gray-400 font-bold text-2xl">
                  {formatCurrency(totalWithdrawn)}
                </p>
              </div>
            </div>
          </div>

          {/* Hareketler Listesi */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Hareketler</h3>
            {wallet.transactions.length === 0 ? (
              <p className="text-gray-400">Henüz işlem bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {wallet.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-semibold">
                          {transaction.type === 'EARNING' ? 'Kampanya Kazancı' : 'Para Çekme'}
                        </p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            transaction.type === 'EARNING'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {transaction.type === 'EARNING' ? 'Kazanç' : 'Çekim'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`font-bold text-lg ${
                        transaction.type === 'EARNING' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {transaction.type === 'EARNING' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Para Çek Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Para Çek</h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Çekilecek Tutar ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="iban" className="block text-sm font-medium text-gray-300 mb-2">
                  IBAN veya Hesap Bilgisi
                </label>
                <input
                  type="text"
                  id="iban"
                  name="iban"
                  required
                  value={withdrawForm.iban}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, iban: e.target.value })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-105"
                >
                  Talep Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

