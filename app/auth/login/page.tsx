'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'influencer' | 'brand'>('influencer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'influencer') {
      setRole('influencer');
    } else if (roleParam === 'brand') {
      setRole('brand');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend'den gelen role'a göre yönlendirme
        if (data.role === 'ADMIN') {
          router.push('/admin/users');
        } else if (data.role === 'BRAND') {
          router.push('/brand/dashboard');
        } else if (data.role === 'INFLUENCER') {
          router.push('/influencer/campaigns');
        } else {
          setError('Geçersiz kullanıcı rolü');
        }
      } else {
        // Hata durumu
        setError(data.message || 'Email veya şifre hatalı');
        console.error('Login error:', data);
      }
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar deneyin');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRegisterLink = () => {
    return `/auth/register?role=${role}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden px-4">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* Ana içerik */}
      <div className="relative z-10 w-full max-w-md">
        {/* Blur efektli kart */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* INFCO Başlığı */}
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter select-none mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                INFCO
              </span>
            </h1>
            <h2 className="text-2xl font-bold text-white">Giriş Yap</h2>
          </div>

          {/* Rol Seçimi Sekmeleri (Görsel amaçlı) */}
          <div className="flex gap-2 mb-6 bg-white/5 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setRole('influencer')}
              className={`flex-1 rounded-md px-4 py-2 font-semibold transition-all duration-200 ${
                role === 'influencer'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Influencer
            </button>
            <button
              type="button"
              onClick={() => setRole('brand')}
              className={`flex-1 rounded-md px-4 py-2 font-semibold transition-all duration-200 ${
                role === 'brand'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Brand
            </button>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </div>
          </form>

          {/* Kayıt ol linki */}
          <div className="mt-6 text-center">
            <Link
              href={getRegisterLink()}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Hesabın yok mu? <span className="text-blue-400 font-semibold">Kayıt ol</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-white">Yükleniyor...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
