import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
      campaignApplicationId,
      campaignId,
      platform,
      contentUrl,
      postedAt,
      likes,
      comments,
      shares,
      followers,
      views,
    } = body

    // Validation ve tip dönüşümleri
    if (!campaignId) {
      return NextResponse.json({ message: 'campaignId is required' }, { status: 400 })
    }
    const campaignIdValue = String(campaignId)

    if (!platform || typeof platform !== 'string') {
      return NextResponse.json({ message: 'platform is required and must be a string' }, { status: 400 })
    }

    if (!contentUrl || typeof contentUrl !== 'string') {
      return NextResponse.json({ message: 'contentUrl is required and must be a string' }, { status: 400 })
    }

    if (!postedAt) {
      return NextResponse.json({ message: 'postedAt is required' }, { status: 400 })
    }

    // Tarih validasyonu
    if (isNaN(Date.parse(postedAt))) {
      return NextResponse.json({ message: 'Geçersiz tarih formatı' }, { status: 400 })
    }
    const postedAtDate = new Date(postedAt)
    if (isNaN(postedAtDate.getTime())) {
      return NextResponse.json({ message: 'Geçersiz tarih formatı' }, { status: 400 })
    }

    // Campaign'in var olup olmadığını kontrol et (pricePer1000View ile birlikte)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignIdValue },
      select: {
        id: true,
        title: true,
        pricePer1000View: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
    }

    // CampaignApplication kontrolü ve tip dönüşümü
    let applicationIdValue: string | null = null
    if (campaignApplicationId) {
      const applicationIdString = String(campaignApplicationId)
      const application = await prisma.campaignApplication.findFirst({
        where: {
          id: applicationIdString,
          campaignId: campaignIdValue,
          influencerId: user.influencerProfile.id,
        },
      })

      if (!application) {
        return NextResponse.json(
          { message: 'Campaign application not found or does not belong to current user' },
          { status: 404 }
        )
      }

      applicationIdValue = application.id
    }

    // Numeric alanları temizle ve validate et
    const validateNumeric = (value: any, fieldName: string): number | null => {
      if (value === '' || value === null || value === undefined) {
        return null
      }
      const num = Number(value)
      if (isNaN(num)) {
        throw new Error(`${fieldName} sayısal olmalı`)
      }
      return num
    }

    let likesNum: number | null = null
    let commentsNum: number | null = null
    let sharesNum: number | null = null
    let followersNum: number | null = null
    let viewsNum: number | null = null

    try {
      likesNum = validateNumeric(likes, 'Likes')
      commentsNum = validateNumeric(comments, 'Comments')
      sharesNum = validateNumeric(shares, 'Shares')
      followersNum = validateNumeric(followers, 'Followers')
      viewsNum = validateNumeric(views, 'Views')
    } catch (validationError) {
      return NextResponse.json(
        { message: validationError instanceof Error ? validationError.message : 'Geçersiz sayısal değer' },
        { status: 400 }
      )
    }

    // Mevcut content'i kontrol et (aynı campaign + influencer için)
    // Bir influencer aynı kampanyaya sadece 1 içerik yükleyebilir
    const existingContent = await prisma.content.findFirst({
      where: {
        campaignId: campaignIdValue,
        influencerId: user.influencerProfile.id,
        // REJECTED içerikler hariç tutulur (reddedilen içerik varsa yeni içerik yüklenebilir)
        NOT: {
          status: 'REJECTED',
        },
      },
    })

    // Eğer mevcut bir içerik varsa (ve REJECTED değilse), yeni içerik oluşturulmasına izin verilmez
    if (existingContent) {
      return NextResponse.json(
        {
          message: 'Bu kampanyaya zaten bir içerik yüklediniz. Mevcut içeriğinizi düzenlemek için "İçeriği Gör / Düzenle" butonunu kullanın.',
        },
        { status: 400 }
      )
    }

    // Kazanç hesaplama (1000 izlenme başına tutar, views ile çarpıp 1000'e böl)
    const viewsNumber = viewsNum || 0
    const pricePer1000View = campaign.pricePer1000View ?? 0
    const earning = (viewsNumber * pricePer1000View) / 1000

    // Content data objesi
    const contentData = {
      platform: platform.trim(),
      contentUrl: contentUrl.trim(),
      postedAt: postedAtDate,
      likes: likesNum,
      comments: commentsNum,
      shares: sharesNum,
      followers: followersNum,
      views: viewsNum,
      status: 'PENDING' as const,
      earning: earning,
    }

    // Yeni content oluştur (existingContent kontrolü yukarıda yapıldı, buraya gelirse yeni içerik oluşturulabilir)
    const content = await prisma.content.create({
      data: {
        campaignId: campaignIdValue,
        influencerId: user.influencerProfile.id,
        applicationId: applicationIdValue,
        ...contentData,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ content, earning }, { status: 201 })
  } catch (error) {
    console.error('CONTENT API ERROR:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}

