import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

type RouteParams = {
  params: Promise<{ id: string }> | { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Admin kontrolü
    const adminCheck = await requireAdmin()

    if (!adminCheck.ok) {
      if (adminCheck.reason === 'UNAUTHENTICATED') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Params'ı resolve et (Next.js 15'te Promise olabilir)
    const resolvedParams = await Promise.resolve(params)
    const userId = resolvedParams.id

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    // User'ı bul
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // User'ı APPROVED yap
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: 'APPROVED' },
    })

    return NextResponse.json(
      { message: 'Kullanıcı onaylandı', user: updated },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

