'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleClick = (role: 'influencer' | 'brand') => {
    setIsOpen(false);
    router.push(`/auth/login?role=${role}`);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* Ana içerik */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 px-4">
        {/* INFCO Başlığı */}
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter select-none">
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse">
            INFCO
          </span>
        </h1>

        {/* Buton ve Dropdown Container */}
        <div className="relative">
          {/* Ana Buton */}
          <button
            onClick={toggleDropdown}
            className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105 hover:opacity-90 transform"
          >
            Etki Yaratmaya Başla
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-48 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 overflow-hidden transition-all duration-200 ease-in-out">
              <button
                onClick={() => handleRoleClick('influencer')}
                className="w-full px-6 py-4 text-left text-white hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-purple-600/20 transition-all duration-200 hover:pl-8 border-b border-gray-700"
              >
                <span className="font-semibold">Influencer</span>
              </button>
              <button
                onClick={() => handleRoleClick('brand')}
                className="w-full px-6 py-4 text-left text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-200 hover:pl-8"
              >
                <span className="font-semibold">Brand</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
