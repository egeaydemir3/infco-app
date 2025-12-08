'use client'

import { useState } from 'react'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      if (res.ok) {
        window.location.href = '/auth/login'
      } else {
        console.error('Logout failed')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full mt-auto px-4 py-3 rounded-lg font-semibold transition-colors bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Çıkılıyor...' : 'Çıkış Yap'}
    </button>
  )
}

