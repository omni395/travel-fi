import { createError, readBody } from 'h3'
import prisma from '~/lib/prisma'
import { transferTokens } from '~/services/token.service'
import { getAdminSettings } from '~/services/adminSettings'

export default defineEventHandler(async (event) => {
  const admin = event.context?.auth?.user
  if (!admin || (admin.role !== 'admin' && admin.role !== 'moderator')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const id = Number(event.context?.params?.id)
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const wifiPoint = await prisma.wifiPoint.findUnique({ where: { id }, include: { user: true } })
  if (!wifiPoint) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (wifiPoint.status === 'approved') return { success: true, message: 'Already approved' }

  // Update status to approved
  await prisma.wifiPoint.update({ where: { id }, data: { status: 'approved' } })

  // Audit log for approval
  await prisma.auditLog.create({ data: { userId: admin.id, action: 'admin.wifi.approve', targetType: 'WifiPoint', targetId: id, result: 'success', metadata: {} } })

  // Reward logic: transfer tokens to the user who created the point (only once)
  try {
  const config = await getAdminSettings()
  const rewardAmount = config.rewardOnApprove ? String(config.rewardOnApprove) : null
  const rewardWeeklyLimit = config.rewardWeeklyLimit ? Number(config.rewardWeeklyLimit) : 5 // default 5 per week

  const user = wifiPoint.user
  if (rewardAmount && Number(rewardAmount) > 0 && user && user.walletAddress) {
      // Check if this wifi point was already rewarded (by looking for a successful audit record)
      const existing = await prisma.auditLog.findFirst({
        where: {
          action: 'token.reward_wifi_approval',
          targetType: 'WifiPoint',
          targetId: id,
          result: 'success',
        },
      })

      if (!existing) {
        // Rate limit: count successful rewards for this user in the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentCount = await prisma.auditLog.count({
          where: {
            action: 'token.reward_wifi_approval',
            userId: user.id,
            result: 'success',
            createdAt: { gte: sevenDaysAgo },
          },
        })

        if (recentCount < rewardWeeklyLimit) {
          // attempt token transfer
          try {
            const tx = await transferTokens(user.walletAddress, rewardAmount)
            await prisma.auditLog.create({
              data: {
                userId: admin.id,
                action: 'token.reward_wifi_approval',
                targetType: 'WifiPoint',
                targetId: id,
                result: 'success',
                metadata: { txHash: tx.hash, to: user.walletAddress, amount: rewardAmount },
              },
            })

            // record contribution (points) for gamification as well
            await prisma.contribution.create({ data: { userId: user.id, type: 'add_wifi_reward', points: config.pointsOnApprove || 10 } })
            // increment user points
            await prisma.user.update({ where: { id: user.id }, data: { points: { increment: Number(config.pointsOnApprove || 10) } } })
          } catch (err: any) {
            // token transfer failed — log failure, but still create an audit entry
            await prisma.auditLog.create({
              data: {
                userId: admin.id,
                action: 'token.reward_wifi_approval',
                targetType: 'WifiPoint',
                targetId: id,
                result: 'failure',
                metadata: { error: String(err), to: user.walletAddress, amount: rewardAmount },
              },
            })
            // as fallback, reward points only
            await prisma.contribution.create({ data: { userId: user.id, type: 'add_wifi_reward_fallback', points: config.pointsOnApproveFallback || 5 } })
            await prisma.user.update({ where: { id: user.id }, data: { points: { increment: Number(config.pointsOnApproveFallback || 5) } } })
          }
        } else {
          // Rate limit exceeded — log and skip token transfer
          await prisma.auditLog.create({ data: { userId: admin.id, action: 'token.reward_wifi_approval', targetType: 'WifiPoint', targetId: id, result: 'failure', reason: 'rate_limit', metadata: { recentCount, rewardWeeklyLimit } } })
        }
      }
    }
  } catch (err) {
    // Don't block approval if reward subsystem fails — log an audit entry
    await prisma.auditLog.create({ data: { userId: admin.id, action: 'token.reward_wifi_approval', targetType: 'WifiPoint', targetId: id, result: 'failure', metadata: { error: String(err) } } })
  }

  return { success: true }
})
