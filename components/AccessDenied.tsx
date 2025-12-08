import Link from 'next/link'

type AccessDeniedProps = {
  message?: string
  loginUrl?: string
}

export default function AccessDenied({ message, loginUrl = '/auth/login' }: AccessDeniedProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tighter mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              INFCO
            </span>
          </h1>
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Erişim Kısıtlı</h2>
          <p className="text-gray-400">
            {message || 'Bu sayfayı görmek için önce giriş yapmalısınız.'}
          </p>
        </div>
        <Link
          href={loginUrl}
          className="block w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
        >
          Giriş Yap
        </Link>
      </div>
    </div>
  )
}

