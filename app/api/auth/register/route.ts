import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      role,
      // Influencer specific fields
      displayName,
      category,
      followerCount,
      country,
      gender,
      ageRange,
      interests,
    } = body

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (!role || (role !== 'INFLUENCER' && role !== 'BRAND')) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password, // Şimdilik düz metin, ileride hash'lenebilir
        role: role as 'INFLUENCER' | 'BRAND',
        status: 'PENDING',
      },
    })

    // Create profile based on role
    if (role === 'INFLUENCER') {
      // Influencer profile validation
      if (!displayName || typeof displayName !== 'string') {
        return NextResponse.json({ message: 'Display name is required for influencers' }, { status: 400 })
      }

      if (!category || typeof category !== 'string') {
        return NextResponse.json({ message: 'Category is required for influencers' }, { status: 400 })
      }

      if (!followerCount || typeof followerCount !== 'number' || followerCount < 0) {
        return NextResponse.json({ message: 'Follower count is required and must be a positive number' }, { status: 400 })
      }

      if (!country || typeof country !== 'string') {
        return NextResponse.json({ message: 'Country is required for influencers' }, { status: 400 })
      }

      // Create influencer profile
      await prisma.influencerProfile.create({
        data: {
          userId: user.id,
          displayName: displayName.trim(),
          bio: null,
          category: category.trim(),
          followerCount: followerCount,
          country: country.trim(),
          gender: gender || null,
          ageRange: ageRange || null,
          interests: interests || null,
        },
      })

      // Otomatik olarak influencer için wallet oluştur
      await prisma.wallet.upsert({
        where: { userId: user.id },
        update: {}, // Mevcut wallet varsa güncelleme yapma
        create: {
          userId: user.id,
          balance: 0,
        },
      })
    } else if (role === 'BRAND') {
      // Brand profile validation
      if (!body.companyName || typeof body.companyName !== 'string') {
        return NextResponse.json({ message: 'Company name is required for brands' }, { status: 400 })
      }

      // Create brand profile
      await prisma.brandProfile.create({
        data: {
          userId: user.id,
          companyName: body.companyName.trim(),
          website: body.website || null,
          description: body.description || null,
        },
      })
    }

    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

