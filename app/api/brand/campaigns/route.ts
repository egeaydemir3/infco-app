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

    if (!user.brandProfile) {
      return NextResponse.json(
        { message: 'Brand profile not found' },
        { status: 404 }
      )
    }

    // Request body'den alanları al
    const body = await request.json()
    const { title, description, platform, totalPool, pricePerView, maxCpm, imageUrl, startDate, endDate, type } = body

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { message: 'title is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!platform || typeof platform !== 'string' || platform.trim() === '') {
      return NextResponse.json(
        { message: 'platform is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!totalPool || typeof totalPool !== 'number' || totalPool <= 0) {
      return NextResponse.json(
        { message: 'totalPool is required and must be a positive number' },
        { status: 400 }
      )
    }

    if (!pricePerView || typeof pricePerView !== 'number' || pricePerView <= 0) {
      return NextResponse.json(
        { message: 'pricePerView is required and must be a positive number' },
        { status: 400 }
      )
    }

    // maxCpm validation (optional, defaults to 0 if not provided)
    const maxCpmValue = maxCpm !== undefined && typeof maxCpm === 'number' ? maxCpm : 0

    // imageUrl normalization (empty strings to null)
    const normalizedImageUrl =
      imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0
        ? imageUrl.trim()
        : null

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    // Tarihleri Date objesine çevir
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    // Tarih validasyonu
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date format' },
        { status: 400 }
      )
    }

    if (endDateObj <= startDateObj) {
      return NextResponse.json(
        { message: 'endDate must be after startDate' },
        { status: 400 }
      )
    }

    // Campaign oluştur
    const campaign = await prisma.campaign.create({
      data: {
        title: title.trim(),
        description: description || '',
        platform: platform.trim(),
        totalPool: totalPool,
        pricePerView: pricePerView,
        maxCpm: maxCpmValue,
        imageUrl: normalizedImageUrl,
        status: 'PENDING_REVIEW',
        startDate: startDateObj,
        endDate: endDateObj,
        brandId: user.brandProfile.id,
      },
      include: {
        brand: {
          select: {
            companyName: true,
          },
        },
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

