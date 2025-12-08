import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import AdminCampaignsTable from './AdminCampaignsTable'
import AccessDenied from '@/components/AccessDenied'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminCampaignsPage() {
  // Admin kontrolü
  const adminCheck = await requireAdmin()

  if (!adminCheck.ok) {
    if (adminCheck.reason === 'UNAUTHENTICATED') {
      redirect('/auth/login')
    }
    // FORBIDDEN durumu
    return (
      <AccessDenied
        message="Bu sayfaya erişiminiz yok. Sadece admin kullanıcılar bu sayfaya erişebilir."
        loginUrl="/auth/login"
      />
    )
  }

  // PENDING_REVIEW kampanyaları çek
  const pendingCampaigns = await prisma.campaign.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      brand: {
        select: { companyName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      {/* Sidebar */}
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
            href="/admin/content"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            İçerik Onayı
          </Link>
          <Link
            href="/admin/campaigns"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white"
          >
            Kampanya Onayı
          </Link>
          <Link
            href="/admin/users"
            className="block px-4 py-3 rounded-lg font-semibold transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            Kullanıcılar
          </Link>
        </nav>
      </div>

      {/* Ana içerik */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Başlık */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tighter mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                INFCO
              </span>
            </h1>
            <h2 className="text-3xl font-bold text-white mb-2">Kampanya Onay Paneli</h2>
            <p className="text-gray-400">İncelemede olan kampanyaları görüntüleyip onaylayabilirsiniz.</p>
          </div>

          {/* Client Component - Tablo */}
          <AdminCampaignsTable campaigns={pendingCampaigns} />
        </div>
      </div>
    </div>
  )
}

