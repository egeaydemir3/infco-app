import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Oturum açan kullanıcıyı bul
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!user.influencerProfile) {
      return NextResponse.json({ message: 'Influencer profile not found' }, { status: 404 })
    }

    // Profil bilgilerini çek
    const profile = await prisma.influencerProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 })
    }

    // Gerekli alanları döndür
    return NextResponse.json(
      {
        displayName: profile.displayName,
        city: profile.city,
        gender: profile.gender,
        ageRange: profile.ageRange,
        category: profile.category,
        instagramFollowers: profile.instagramFollowers,
        tiktokFollowers: profile.tiktokFollowers,
        youtubeFollowers: profile.youtubeFollowers,
        instagramUrl: profile.instagramUrl,
        tiktokUrl: profile.tiktokUrl,
        youtubeUrl: profile.youtubeUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('PROFILE GET ERROR:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Oturum açan kullanıcıyı bul
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!user.influencerProfile) {
      return NextResponse.json({ message: 'Influencer profile not found' }, { status: 404 })
    }

    // Request body'den alanları al
    const body = await request.json()
    const {
      displayName,
      city,
      gender,
      ageRange,
      category,
      instagramFollowers,
      tiktokFollowers,
      youtubeFollowers,
      instagramUrl,
      tiktokUrl,
      youtubeUrl,
    } = body

    // Validation
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return NextResponse.json({ message: 'Display name is required' }, { status: 400 })
    }

    // Profil güncelle
    const updatedProfile = await prisma.influencerProfile.update({
      where: { userId: user.id },
      data: {
        displayName: displayName.trim(),
        city: city?.trim() || null,
        gender: gender || null,
        ageRange: ageRange || null,
        category: category?.trim() || null,
        instagramFollowers: instagramFollowers ? Number(instagramFollowers) : null,
        tiktokFollowers: tiktokFollowers ? Number(tiktokFollowers) : null,
        youtubeFollowers: youtubeFollowers ? Number(youtubeFollowers) : null,
        instagramUrl: instagramUrl?.trim() || null,
        tiktokUrl: tiktokUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
      },
    })

    return NextResponse.json({ profile: updatedProfile, message: 'Profile updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('PROFILE UPDATE ERROR:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}

