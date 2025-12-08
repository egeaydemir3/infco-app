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
    const contentId = resolvedParams.id

    if (!contentId || typeof contentId !== 'string') {
      return NextResponse.json({ message: 'Content ID is required' }, { status: 400 })
    }

    // Content'i bul
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        campaign: {
          select: {
            id: true,
            pricePerView: true,
          },
        },
        influencer: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    // Content zaten onaylanmış veya reddedilmişse
    if (content.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Bu içerik zaten onaylanmış veya reddedilmiş' },
        { status: 400 }
      )
    }

    // Kazancı al
    const earning = content.earning ?? (content.views || 0) * (content.campaign.pricePerView ?? 0)

    // Influencer'ın wallet'ını bul veya oluştur
    let wallet = await prisma.wallet.findFirst({
      where: { userId: content.influencer.userId },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: content.influencer.userId,
          balance: 0,
        },
      })
    }

    // Content'i APPROVED yap
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: { status: 'APPROVED' },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Eğer earning > 0 ise WalletTransaction oluştur
    if (earning > 0) {
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'EARNING',
          amount: earning,
          relatedCampaignId: content.campaignId,
          relatedContentId: content.id,
        },
      })

      // Wallet balance'ı güncelle (tüm transaction'ları hesaplayarak)
      const txs = await prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
      })

      const balance = txs.reduce(
        (sum: number, tx: { type: string; amount: number }) => sum + (tx.type === 'EARNING' ? tx.amount : -Math.abs(tx.amount)),
        0
      )

      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance },
      })

      // Güncellenmiş wallet'ı al
      const updatedWallet = await prisma.wallet.findUnique({
        where: { id: wallet.id },
      })

      return NextResponse.json(
        {
          message: 'Content approved',
          contentId: updatedContent.id,
          earning,
          walletBalance: updatedWallet?.balance ?? 0,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        message: 'Content approved',
        contentId: updatedContent.id,
        earning: 0,
        walletBalance: wallet.balance,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('APPROVE CONTENT API ERROR:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}

