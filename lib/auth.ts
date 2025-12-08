import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('infco_user')?.value

  if (!raw) return null

  // İçerik JSON string ise parse et
  let parsed: { userId: string; role: string } | null = null
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    return null
  }

  if (!parsed?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    include: {
      influencerProfile: true,
      brandProfile: true,
    },
  })

  return user
}

const ADMIN_EMAILS = [
  'admin@infco.app',
  // İstersen buraya daha fazla admin email eklenebilir
]

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    return { ok: false, reason: 'UNAUTHENTICATED' as const }
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    return { ok: false, reason: 'FORBIDDEN' as const }
  }

  return { ok: true, user }
}

