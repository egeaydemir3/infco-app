import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role: requestedRole } = body

    // Email ve password kontrolü
    if (!email || !password) {
      return NextResponse.json({ message: 'Email ve şifre gereklidir' }, { status: 400 })
    }

    // Requested role kontrolü (influencer veya brand olmalı)
    if (requestedRole && requestedRole !== 'influencer' && requestedRole !== 'brand') {
      return NextResponse.json({ message: 'Geçersiz rol' }, { status: 400 })
    }

    // User'ı bul
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Debug log
    console.log('LOGIN DEBUG:', {
      email,
      password,
      requestedRole,
      userFound: !!user,
      userRole: user?.role,
      passwordHash: user?.passwordHash,
      passwordMatch: user ? user.passwordHash === password : false,
    })

    // User yoksa veya şifre eşleşmiyorsa
    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ message: 'Geçersiz email veya şifre' }, { status: 401 })
    }

    // Status kontrolü: Kullanıcı onaylanmış olmalı
    if (user.status !== 'APPROVED') {
      return NextResponse.json(
        { message: 'Henüz onaylanmamış bir hesaba sahipsiniz.' },
        { status: 403 }
      )
    }

    // Role kontrolü: Eğer requestedRole varsa, user'ın role'ü ile eşleşmeli
    if (requestedRole) {
      const expectedRole = requestedRole === 'influencer' ? 'INFLUENCER' : 'BRAND'
      if (user.role !== expectedRole) {
        if (requestedRole === 'influencer') {
          return NextResponse.json(
            { message: 'Bu email influencer hesabı değil' },
            { status: 403 }
          )
        } else {
          return NextResponse.json(
            { message: 'Bu email brand hesabı değil' },
            { status: 403 }
          )
        }
      }
    }

    // Cookie set et
    const cookieStore = await cookies()
    cookieStore.set('infco_user', JSON.stringify({ userId: user.id, role: user.role }), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Başarılı response
    return NextResponse.json({ role: user.role }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Bir hata oluştu' }, { status: 500 })
  }
}

