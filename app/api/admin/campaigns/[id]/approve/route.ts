import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
    const campaignId = resolvedParams.id

    // Campaign'i bul
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
    }

    // Status kontrolü
    if (campaign.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { message: 'Campaign is not pending review' },
        { status: 400 }
      )
    }

    // Campaign'i ACTIVE yap
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'ACTIVE' },
    })

    return NextResponse.json(
      { message: 'Campaign approved', campaign: updatedCampaign },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error approving campaign:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

