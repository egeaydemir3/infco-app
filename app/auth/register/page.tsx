'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'influencer' | 'brand'>('influencer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Influencer specific fields
  const [displayName, setDisplayName] = useState('')
  const [category, setCategory] = useState('beauty')
  const [followerCount, setFollowerCount] = useState<number | ''>('')
  const [country, setCountry] = useState('')
  const [gender, setGender] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  // Brand specific fields
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'influencer') {
      setRole('influencer')
    } else if (roleParam === 'brand') {
      setRole('brand')
    }
  }, [searchParams])

  const interestOptions = ['Makyaj', 'Eğlence', 'Moda', 'Teknoloji', 'Oyun', 'Yaşam Tarzı']

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const payload: any = {
        email,
        password,
        role: role.toUpperCase(),
      }

      if (role === 'influencer') {
        // Influencer validations
        if (!displayName.trim()) {
          setError('İsim gereklidir')
          setIsLoading(false)
          return
        }

        if (!category) {
          setError('Kategori gereklidir')
          setIsLoading(false)
          return
        }

        if (!followerCount || typeof followerCount !== 'number' || followerCount < 0) {
          setError('Geçerli bir takipçi sayısı giriniz')
          setIsLoading(false)
          return
        }

        if (!country.trim()) {
          setError('Ülke gereklidir')
          setIsLoading(false)
          return
        }

        payload.displayName = displayName.trim()
        payload.category = category
        payload.followerCount = followerCount
        payload.country = country.trim()
        payload.gender = gender || null
        payload.ageRange = ageRange || null
        payload.interests = interests.length > 0 ? interests.join(',') : null
      } else {
        // Brand validations
        if (!companyName.trim()) {
          setError('Şirket adı gereklidir')
          setIsLoading(false)
          return
        }

        payload.companyName = companyName.trim()
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        // Başarılı - login sayfasına yönlendir
        alert('Kayıt başarılı! Giriş yapabilirsiniz.')
        router.push(`/auth/login?role=${role}`)
      } else {
        setError(data.message || 'Kayıt sırasında bir hata oluştu')
      }
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar deneyin')
      console.error('Register error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getLoginLink = () => {
    return `/auth/login?role=${role}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden px-4 py-8">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      {/* Ana içerik */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Blur efektli kart */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* INFCO Başlığı */}
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter select-none mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                INFCO
              </span>
            </h1>
            <h2 className="text-2xl font-bold text-white">Kayıt Ol</h2>
          </div>

          {/* Rol Seçimi Sekmeleri */}
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
            {/* Email */}
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            {/* Influencer Specific Fields */}
            {role === 'influencer' && (
              <>
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                    İsim
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Kullanıcı adınız"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Kategori
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="beauty">Beauty</option>
                    <option value="fashion">Fashion</option>
                    <option value="gaming">Gaming</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="tech">Tech</option>
                    <option value="food">Food</option>
                  </select>
                </div>

                {/* Follower Count */}
                <div>
                  <label htmlFor="followerCount" className="block text-sm font-medium text-gray-300 mb-2">
                    Takipçi Sayısı
                  </label>
                  <input
                    id="followerCount"
                    name="followerCount"
                    type="number"
                    required
                    min="0"
                    value={followerCount}
                    onChange={(e) => setFollowerCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                    Ülke
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Türkiye"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">
                    Cinsiyet
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seçiniz</option>
                    <option value="MALE">Erkek</option>
                    <option value="FEMALE">Kadın</option>
                    <option value="OTHER">Diğer / Belirtmek istemiyorum</option>
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label htmlFor="ageRange" className="block text-sm font-medium text-gray-300 mb-2">
                    Yaş Aralığı
                  </label>
                  <select
                    id="ageRange"
                    name="ageRange"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seçiniz</option>
                    <option value="13-17">13-17</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35+">35+</option>
                  </select>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">İlgi Alanları</label>
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map((interest) => (
                      <label
                        key={interest}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          interests.includes(interest)
                            ? 'bg-blue-500/20 border-blue-500/50 text-white'
                            : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={interests.includes(interest)}
                          onChange={() => handleInterestToggle(interest)}
                          disabled={isLoading}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Brand Specific Fields */}
            {role === 'brand' && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Şirket Adı
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Şirket adınız"
                />
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </div>
          </form>

          {/* Giriş yap linki */}
          <div className="mt-6 text-center">
            <Link
              href={getLoginLink()}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Zaten hesabın var mı? <span className="text-blue-400 font-semibold">Giriş yap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-white">Yükleniyor...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
