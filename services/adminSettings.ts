import prisma from '~/lib/prisma'

type AdminSettings = {
  rewardOnApprove?: string | null
  rewardWeeklyLimit?: number
  pointsOnApprove?: number
  pointsOnApproveFallback?: number
}

let cache: { ts: number; value: AdminSettings } | null = null
const TTL = 30 * 1000 // 30 seconds

export async function getAdminSettings(): Promise<AdminSettings> {
  const now = Date.now()
  if (cache && now - cache.ts < TTL) return cache.value

  try {
    const rows = await prisma.adminSetting.findMany()
    const map: Record<string, any> = {}
    for (const r of rows) {
      try {
        map[r.key] = r.value
      } catch (e) {
        map[r.key] = r.value
      }
    }

    const result: AdminSettings = {
      rewardOnApprove: map.rewardOnApprove || null,
      rewardWeeklyLimit: map.rewardWeeklyLimit ? Number(map.rewardWeeklyLimit) : 5,
      pointsOnApprove: map.pointsOnApprove ? Number(map.pointsOnApprove) : 10,
      pointsOnApproveFallback: map.pointsOnApproveFallback ? Number(map.pointsOnApproveFallback) : 5,
    }

    cache = { ts: now, value: result }
    return result
  } catch (err) {
    // If DB is not migrated yet or other error, return sensible defaults
    return {
      rewardOnApprove: null,
      rewardWeeklyLimit: 5,
      pointsOnApprove: 10,
      pointsOnApproveFallback: 5,
    }
  }
}
