'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default function NewCampaignPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'Instagram',
    totalPool: '',
    pricePer1000View: '',
    maxCpm: '15',
    imageUrl: '',
    startDate: '',
    endDate: '',
    type: 'Post',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form verilerini API formatına çevir
      const payload: any = {
        title: formData.title,
        description: formData.description,
        platform: formData.platform,
        totalPool: parseFloat(formData.totalPool),
        pricePer1000View: parseFloat(formData.pricePer1000View),
        maxCpm: parseFloat(formData.maxCpm),
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
      };

      // imageUrl boş değilse ekle
      if (formData.imageUrl && formData.imageUrl.trim() !== '') {
        payload.imageUrl = formData.imageUrl.trim();
      }

      const response = await fetch('/api/brand/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Başarılı
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/brand/campaigns');
        }, 1500);
      } else {
        // Hata durumu
        const errorMessage = data.message || 'Kampanya oluşturulurken bir hata oluştu';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Kampanya oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };

    // Platform değiştiğinde maxCpm'i otomatik ayarla
    if (e.target.name === 'platform') {
      const platformDefaults: Record<string, string> = {
        TikTok: '10',
        Instagram: '15',
        YouTube: '20',
      };
      newFormData.maxCpm = platformDefaults[e.target.value] || '15';
    }

    setFormData(newFormData);
  };

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
            href="/brand/dashboard"
            className={`block px-4 py-3 rounded-lg font-semibold transition-colors ${
              pathname === '/brand/dashboard'
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/brand/campaigns"
            className={`block px-4 py-3 rounded-lg font-semibold transition-colors ${
              pathname === '/brand/campaigns'
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Kampanyalarım
          </Link>
          <Link
            href="/brand/campaigns/new"
            className={`block px-4 py-3 rounded-lg font-semibold transition-colors ${
              pathname === '/brand/campaigns/new'
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Yeni Kampanya
          </Link>
          <div className="px-4 py-3 rounded-lg bg-white/5 text-gray-300 font-medium cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
            Ayarlar
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </div>

      {/* SAĞ SÜTUN - Form İçeriği */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl">
          {/* Başlık */}
          <h2 className="text-3xl font-bold text-white mb-8">Yeni Kampanya Oluştur</h2>

          {/* Success Mesajı */}
          {showSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">
              Kampanya başarıyla oluşturuldu!
            </div>
          )}

          {/* Form Kartı */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kampanya Başlığı */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Kampanya Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Örn: Yaz Koleksiyonu Lansmanı"
                />
              </div>

              {/* Kampanya Brief'i */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Kampanya Brief'i (İçerik Detayları)
                </label>
                <p className="text-sm text-gray-400 mt-1 mb-3">
                  Influencer'ın videoda ne yapması gerektiğini, değinmesi gereken noktaları ve zorunlu kuralları buraya yazın.
                </p>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none min-h-[160px]"
                  placeholder={`Örnek:
- Videoda ürün en az 5 saniye görünmeli
- Marka adı en az 1 kez söylenmeli
- #infco ve #kampanyaetiketi hashtagleri eklenmeli
- Hedef kitle: Türkiye, 18-24 yaş
- Yasaklar: Rakip marka adı geçmemeli, küfür/hakaret olmamalı`}
                />
              </div>

              {/* Platform ve Tür */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-2">
                    Platform
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    required
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitch">Twitch</option>
                    <option value="Twitter">Twitter</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                    Tür
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Post">Post</option>
                    <option value="UGC">UGC</option>
                    <option value="Story">Story</option>
                    <option value="Reel">Reel</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
              </div>

              {/* Toplam Ödül Havuzu ve Fiyat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="totalPool" className="block text-sm font-medium text-gray-300 mb-2">
                    Toplam Ödül Havuzu ($)
                  </label>
                  <input
                    type="number"
                    id="totalPool"
                    name="totalPool"
                    required
                    min="0"
                    step="0.01"
                    value={formData.totalPool}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label htmlFor="pricePer1000View" className="block text-sm font-medium text-gray-300 mb-2">
                    1000 İzlenme Başı Ücret ($)
                  </label>
                  <input
                    type="number"
                    id="pricePer1000View"
                    name="pricePer1000View"
                    required
                    min="0"
                    step="0.01"
                    value={formData.pricePer1000View}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="1.00"
                  />
                </div>
              </div>

              {/* Maximum CPM */}
              <div>
                <label htmlFor="maxCpm" className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum CPM ($)
                </label>
                <input
                  type="number"
                  id="maxCpm"
                  name="maxCpm"
                  required
                  min="0"
                  step="0.01"
                  value={formData.maxCpm}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="15.00"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Platform seçimine göre otomatik ayarlanır: TikTok (10), Instagram (15), YouTube (20)
                </p>
              </div>

              {/* Kampanya Görseli URL'si */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Kampanya Görseli URL'si (opsiyonel)
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-gray-400">
                  Görselinizi Google Drive, Dropbox veya kendi sitenizden bir URL olarak ekleyebilirsiniz. Boş bırakabilirsiniz.
                </p>
              </div>

              {/* Tarihler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit Butonu */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg px-6 py-4 font-bold text-white text-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] hover:scale-105'
                  }`}
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Kampanyayı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

