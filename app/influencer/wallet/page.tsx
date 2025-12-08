import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import WalletClient from './WalletClient'
import LogoutButton from '@/components/LogoutButton'
import AccessDenied from '@/components/AccessDenied'

export default async function WalletPage() {
  // Oturum açan kullanıcıyı bul
  const user = await getCurrentUser()

  if (!user || user.role !== 'INFLUENCER') {
    return (
      <AccessDenied
        message="Bu alanı görmek için influencer olarak giriş yapmalısınız."
        loginUrl="/auth/login?role=influencer"
      />
    )
  }

  // Wallet ve transaction'ları çek
  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  // Bekleyen içerikleri çek (PENDING status)
  const pendingContents = await prisma.content.findMany({
    where: {
      influencerId: user.influencerProfile.id,
      status: 'PENDING',
    },
  })

  // Bekleyen kazanç hesapla
  const pendingEarnings = pendingContents.reduce((sum, content) => sum + (content.earning || 0), 0)

  // Eğer wallet yoksa boş bir wallet oluştur
  if (!wallet) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="relative z-10 w-64 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-3xl font-black tracking-tighter select-none">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                INFCO
              </span>
            </h1>
          </div>
        </div>
        <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Cüzdan Bulunamadı</h2>
            <p className="text-gray-400">Cüzdanınız henüz oluşturulmamış.</p>
          </div>
        </div>
      </div>
    )
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
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
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
          <div className="px-4 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white">
            Cüzdan
          </div>
          <div className="px-4 py-3 rounded-lg bg-white/5 text-gray-300 font-medium cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
            Ayarlar
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </div>

      {/* Client Component - Wallet İçeriği */}
      <WalletClient wallet={wallet} pendingEarnings={pendingEarnings} />
    </div>
  )
}
