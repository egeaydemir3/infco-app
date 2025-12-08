'use client';

import { useRouter, useParams } from 'next/navigation';
import { formatNumber } from '@/lib/format';

// Mock kampanya verisi (liste sayfasıyla aynı)
const mockCampaigns = [
  {
    id: '1',
    title: 'Yaz Koleksiyonu Lansmanı',
    brandName: 'FashionHub',
    platform: 'Instagram',
    totalPool: 50000,
    pricePerView: 2.5,
    shortDescription: 'Yeni yaz koleksiyonumuzu tanıtmak için influencer arıyoruz. Genç ve dinamik bir kitleye hitap eden içerikler bekliyoruz.',
    description: 'FashionHub olarak yeni yaz koleksiyonumuzu tanıtmak için siz değerli influencer\'larımızla çalışmak istiyoruz. Bu kampanyada, koleksiyonumuzun öne çıkan parçalarını kullanarak yaratıcı içerikler üretmenizi bekliyoruz. Genç ve dinamik bir kitleye hitap eden, trendleri yakından takip eden bir yaklaşım tercih ediyoruz. İçeriklerinizde ürünlerimizin kalitesini, stilini ve kullanım kolaylığını vurgulamanızı istiyoruz. Kampanya süresince düzenli içerik paylaşımı yapmanız ve markamızla uyumlu bir dil kullanmanız önemlidir.',
  },
  {
    id: '2',
    title: 'Teknoloji Ürün İncelemesi',
    brandName: 'TechWorld',
    platform: 'YouTube',
    totalPool: 75000,
    pricePerView: 3.0,
    shortDescription: 'Yeni akıllı telefon modelimizi detaylı bir şekilde inceleyecek tech influencer\'lar arıyoruz.',
    description: 'TechWorld olarak yeni akıllı telefon modelimizi detaylı bir şekilde inceleyecek teknoloji influencer\'larını arıyoruz. Bu kampanyada, telefonun teknik özelliklerini, performansını, kamera kalitesini ve kullanıcı deneyimini kapsamlı bir şekilde ele almanızı bekliyoruz. İnceleme videolarınızda objektif bir yaklaşım sergilemeniz ve hem güçlü yönlerini hem de geliştirilebilecek noktaları dürüstçe paylaşmanız önemlidir. Detaylı testler, karşılaştırmalar ve gerçek kullanım senaryoları içeren içerikler tercih ediyoruz.',
  },
  {
    id: '3',
    title: 'Fitness Programı Tanıtımı',
    brandName: 'FitLife',
    platform: 'TikTok',
    totalPool: 30000,
    pricePerView: 1.5,
    shortDescription: 'Yeni fitness uygulamamızı kullanarak kısa videolar çekecek influencer\'lar arıyoruz.',
    description: 'FitLife uygulaması olarak yeni fitness programımızı tanıtmak için TikTok influencer\'larını arıyoruz. Bu kampanyada, uygulamamızı kullanarak kısa, etkileyici ve motive edici videolar çekmenizi bekliyoruz. Videolarınızda uygulamanın özelliklerini, antrenman programlarını ve kullanıcı deneyimini eğlenceli bir şekilde göstermeniz önemlidir. Genç ve aktif bir kitleye hitap eden, enerjik ve pozitif bir ton kullanmanızı tercih ediyoruz. Kampanya boyunca düzenli içerik paylaşımı yapmanız beklenmektedir.',
  },
  {
    id: '4',
    title: 'Kozmetik Ürün Testi',
    brandName: 'BeautyGlow',
    platform: 'Instagram',
    totalPool: 40000,
    pricePerView: 2.0,
    shortDescription: 'Yeni makyaj ürünlerimizi test edip deneyimlerini paylaşacak beauty influencer\'lar arıyoruz.',
    description: 'BeautyGlow olarak yeni makyaj ürünlerimizi test edip deneyimlerini paylaşacak beauty influencer\'larını arıyoruz. Bu kampanyada, ürünlerimizi kullanarak makyaj tutorial\'ları, before/after karşılaştırmaları ve ürün incelemeleri hazırlamanızı bekliyoruz. İçeriklerinizde ürünlerin renklerini, dokusunu, kalıcılığını ve uygulama kolaylığını detaylı bir şekilde göstermeniz önemlidir. Doğal ışıkta çekimler ve farklı cilt tonlarında testler yapmanızı tercih ediyoruz. Dürüst ve samimi bir yaklaşım sergilemeniz markamız için çok değerlidir.',
  },
  {
    id: '5',
    title: 'Oyun Lansmanı',
    brandName: 'GameStudio',
    platform: 'Twitch',
    totalPool: 100000,
    pricePerView: 5.0,
    shortDescription: 'Yeni oyunumuzu canlı yayında oynayacak ve izleyicilere tanıtacak gaming influencer\'lar arıyoruz.',
    description: 'GameStudio olarak yeni oyunumuzu canlı yayında oynayacak ve izleyicilere tanıtacak gaming influencer\'larını arıyoruz. Bu kampanyada, oyunumuzu canlı yayınlarda oynayarak oyunculara tanıtmanızı bekliyoruz. Yayınlarınızda oyunun hikayesini, mekaniklerini, grafiklerini ve genel oynanış deneyimini detaylı bir şekilde ele almanız önemlidir. İzleyicilerle etkileşim kurarak onların sorularını yanıtlamanız ve oyun hakkında samimi görüşlerinizi paylaşmanızı tercih ediyoruz. Kampanya süresince düzenli yayınlar yapmanız beklenmektedir.',
  },
  {
    id: '6',
    title: 'Yemek Tarifi Serisi',
    brandName: 'FoodieBrand',
    platform: 'YouTube',
    totalPool: 35000,
    pricePerView: 1.8,
    shortDescription: 'Ürünlerimizi kullanarak yemek tarifleri hazırlayacak food influencer\'lar arıyoruz.',
    description: 'FoodieBrand olarak ürünlerimizi kullanarak yemek tarifleri hazırlayacak food influencer\'larını arıyoruz. Bu kampanyada, ürünlerimizi kullanarak yaratıcı ve lezzetli yemek tarifleri hazırlamanızı bekliyoruz. Videolarınızda tariflerin adım adım hazırlanışını, malzemelerin kullanımını ve sonuçların görsel sunumunu detaylı bir şekilde göstermeniz önemlidir. Yemek kültürüne saygılı, eğitici ve eğlenceli bir yaklaşım sergilemenizi tercih ediyoruz. Kampanya boyunca farklı tarifler ve yemek kategorilerinde içerikler üretmeniz beklenmektedir.',
  },
];

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const campaign = mockCampaigns.find((c) => c.id === id);

  const handleApply = () => {
    console.log('Kampanyaya başvuru simüle edildi');
    alert('Başvuru gönderildi (mock)');
  };

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              INFCO
            </span>
          </h1>
          <p className="text-white text-xl">Kampanya bulunamadı</p>
          <button
            onClick={() => router.push('/influencer/campaigns')}
            className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-105"
          >
            Kampanyalara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* Ana içerik */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Başlık Bölümü */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter select-none mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              INFCO
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{campaign.title}</h2>
        </div>

        {/* Kampanya Detay Kartı */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl mb-6">
          {/* Platform Badge ve Fiyat */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 text-sm font-semibold border border-blue-500/30">
                {campaign.platform}
              </span>
              <span className="text-gray-400 text-sm">
                <span className="text-white font-semibold">{campaign.brandName}</span>
              </span>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Görüntüleme Başına</p>
              <p className="text-green-400 font-bold text-2xl">
                ₺{campaign.pricePerView.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Toplam Havuz */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <p className="text-gray-400 text-sm mb-1">Toplam Kampanya Havuzu</p>
            <p className="text-white font-bold text-3xl">
              ₺{formatNumber(campaign.totalPool)}
            </p>
          </div>

          {/* Uzun Açıklama */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-3">Kampanya Detayları</h3>
            <p className="text-gray-300 leading-relaxed">{campaign.description}</p>
          </div>
        </div>

        {/* Başvuru Butonu */}
        <button
          onClick={handleApply}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-bold text-white text-xl shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105"
        >
          Bu Kampanyaya Başvur
        </button>

        {/* Geri Dön Butonu */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/influencer/campaigns')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Kampanyalara Dön
          </button>
        </div>
      </div>
    </div>
  );
}

