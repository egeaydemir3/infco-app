import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Oturum açan kullanıcıyı bul
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!user.influencerProfile) {
      return NextResponse.json(
        { message: 'Lütfen önce profilinizi doldurun.', code: 'PROFILE_INCOMPLETE' },
        { status: 400 }
      )
    }

    // Profil tamamlanmış mı kontrol et
    const profile = await prisma.influencerProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { message: 'Lütfen önce profilinizi doldurun.', code: 'PROFILE_INCOMPLETE' },
        { status: 400 }
      )
    }

    // Temel bilgiler kontrolü
    const hasBasicInfo =
      !!profile.displayName &&
      !!profile.city &&
      !!profile.gender &&
      !!profile.ageRange &&
      !!profile.category

    // Takipçi sayıları kontrolü (en az bir platform'da takipçi olmalı)
    const hasFollowers =
      (profile.instagramFollowers ?? 0) > 0 ||
      (profile.tiktokFollowers ?? 0) > 0 ||
      (profile.youtubeFollowers ?? 0) > 0

    const isProfileComplete = hasBasicInfo && hasFollowers

    if (!isProfileComplete) {
      return NextResponse.json(
        {
          message: 'Kampanyalara başvurmak için lütfen profilinizi tamamlayın.',
          code: 'PROFILE_INCOMPLETE',
        },
        { status: 400 }
      )
    }

    // Request body'den campaignId al
    const body = await request.json()
    const { campaignId } = body

    // campaignId kontrolü
    if (!campaignId || typeof campaignId !== 'string') {
      return NextResponse.json(
        { message: 'campaignId is required and must be a string' },
        { status: 400 }
      )
    }

    // Campaign'in var olup olmadığını kontrol et
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Daha önce bu kampanyaya başvuru yapılmış mı kontrol et
    const existingApplication = await prisma.campaignApplication.findFirst({
      where: {
        campaignId: campaignId,
        influencerId: user.influencerProfile.id,
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { message: 'Application already exists for this campaign', application: existingApplication },
        { status: 409 }
      )
    }

    // CampaignApplication oluştur
    const application = await prisma.campaignApplication.create({
      data: {
        campaignId: campaignId,
        influencerId: user.influencerProfile.id,
        status: 'APPROVED',
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
        influencer: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

