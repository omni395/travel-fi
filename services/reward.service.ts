import prisma from '~/lib/prisma'
import { ethers } from 'ethers'
import { getProvider, getSigner, TRAVELFI_TOKEN_ABI, TRAVELFI_TOKEN_ADDRESS } from '~/lib/web3'

import type { RewardResult, WeeklyLimits, RewardType, TokenTransfer } from '~/types/reward'
import type { Contribution } from '@prisma/client'

export class RewardService {
  private static instance: RewardService
  private settings: Record<string, number> = {}
  private lastSettingsUpdate = 0

  private constructor() {}

  static getInstance(): RewardService {
    if (!RewardService.instance) {
      RewardService.instance = new RewardService()
    }
    return RewardService.instance
  }

  private async loadSettings(): Promise<void> {
    const now = Date.now()
    if (now - this.lastSettingsUpdate < 5 * 60 * 1000) return

    const settings = await prisma.adminSetting.findMany()
    this.settings = settings.reduce<Record<string, number>>((acc, setting) => {
      acc[setting.key] = Number(setting.value)
      return acc
    }, {})
    this.lastSettingsUpdate = now
  }

  private async getSetting(key: string): Promise<number> {
    await this.loadSettings()
    return this.settings[key] ?? 0
  }

  private async checkWeeklyLimit(userId: number): Promise<WeeklyLimits> {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [contributions, transactions] = await Promise.all([
      prisma.contribution.findMany({
        where: { userId, createdAt: { gte: weekAgo } }
      }),
      prisma.tokenTransaction.findMany({
        where: { userId, createdAt: { gte: weekAgo }, status: 'completed' }
      })
    ])

    const weeklyPoints = contributions.reduce((sum, contrib) => sum + (contrib.points ?? 0), 0)
    const weeklyTokens = transactions.reduce((sum, tx) => sum + (Number(tx.amount) ?? 0), 0)

    const pointsLimit = await this.getSetting('weeklyPointsLimit')
    const tokensLimit = await this.getSetting('weeklyTokensLimit')

    return {
      points: Math.max(0, pointsLimit - weeklyPoints),
      tokens: Math.max(0, tokensLimit - weeklyTokens)
    }
  }

  private async grantReward(
    userId: number,
    type: RewardType,
    points: number = 0,
    tokens: number = 0,
    targetId?: number
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, points: true, walletAddress: true }
    })
    if (!user) throw new Error('User not found')

    const rewardAmount = user.walletAddress ? tokens : points
    if (rewardAmount <= 0) return

    await prisma.$transaction(async (prisma) => {
      await prisma.contribution.create({
        data: {
          userId,
          type,
          points: user.walletAddress ? 0 : rewardAmount,
          ...(targetId ? { reportId: targetId } : {})
        }
      })

      if (user.walletAddress) {
        const provider = await getProvider()
        const signer = await getSigner(provider)
        if (!ethers?.Contract) {
          throw new Error('ethers.Contract is not available')
        }
        const contract = new ethers.Contract(
          TRAVELFI_TOKEN_ADDRESS,
          TRAVELFI_TOKEN_ABI,
          signer
        )

        try {
          if (!contract?.transfer) {
            throw new Error('Contract or transfer method not available')
          }
          const tx = await contract.transfer(
            user.walletAddress,
            ethers.parseEther(rewardAmount.toString())
          )
          await tx.wait()
        } catch (error) {
          console.error('Failed to transfer tokens:', error)
          throw new Error('Token transfer failed')
        }
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { points: (user.points ?? 0) + rewardAmount }
        })
      }
    })
  }

  private async revokeReward(userId: number, type: string, targetId?: number): Promise<void> {
    const contribution = await prisma.contribution.findFirst({
      where: {
        userId,
        type,
        ...(targetId ? { reportId: targetId } : {})
      }
    })

    if (!contribution) return

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, walletAddress: true }
    })
    if (!user) return

    await prisma.$transaction(async (tx) => {
      await tx.contribution.delete({
        where: { id: contribution.id }
      })

      await tx.user.update({
        where: { id: userId },
        data: { points: Math.max(0, (user.points ?? 0) - (contribution.points ?? 0)) }
      })
    })
  }

  async rewardWifiPoint(userId: number): Promise<RewardResult> {
    const { points = 0, tokens = 0 } = await this.checkWeeklyLimit(userId)
    const [pointLimit = 0, tokenLimit = 0] = await Promise.all([
      this.getSetting('pointsWifiPoints'),
      this.getSetting('rewardWifiPoints')
    ])

    const pointReward = Math.min(points, pointLimit)
    const tokenReward = Math.min(tokens, tokenLimit)

    await this.grantReward(userId, 'add_wifi', pointReward, tokenReward)
    return { points: pointReward, tokens: tokenReward }
  }

  async rewardSecurityReport(userId: number, reportId: number): Promise<RewardResult> {
    const { points = 0, tokens = 0 } = await this.checkWeeklyLimit(userId)
    const [pointLimit = 0, tokenLimit = 0] = await Promise.all([
      this.getSetting('pointsSecurity'),
      this.getSetting('rewardSecurity')
    ])

    const pointReward = Math.min(points, pointLimit)
    const tokenReward = Math.min(tokens, tokenLimit)

    await this.grantReward(userId, 'security_report', pointReward, tokenReward, reportId)
    return { points: pointReward, tokens: tokenReward }
  }

  async rewardReview(userId: number): Promise<RewardResult> {
    const { points = 0, tokens = 0 } = await this.checkWeeklyLimit(userId)
    const [pointLimit = 0, tokenLimit = 0] = await Promise.all([
      this.getSetting('pointsReview'),
      this.getSetting('rewardReview')
    ])

    const pointReward = Math.min(points, pointLimit)
    const tokenReward = Math.min(tokens, tokenLimit)

    await this.grantReward(userId, 'add_review', pointReward, tokenReward)
    return { points: pointReward, tokens: tokenReward }
  }

  async rewardEsimProvider(userId: number): Promise<RewardResult> {
    const { points = 0, tokens = 0 } = await this.checkWeeklyLimit(userId)
    const [pointLimit = 0, tokenLimit = 0] = await Promise.all([
      this.getSetting('pointsEsim'),
      this.getSetting('rewardEsim')
    ])

    const pointReward = Math.min(points, pointLimit)
    const tokenReward = Math.min(tokens, tokenLimit)

    await this.grantReward(userId, 'add_esim', pointReward, tokenReward)
    return { points: pointReward, tokens: tokenReward }
  }

  async revokeSecurityReport(userId: number, reportId: number): Promise<void> {
    await this.revokeReward(userId, 'security_report', reportId)
  }

  async revokeReview(userId: number): Promise<void> {
    await this.revokeReward(userId, 'add_review')
  }

  async convertPointsToTokens(userId: number, walletAddress: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    })
    if (!user) throw new Error('User not found')

    const userPoints = user.points ?? 0
    if (userPoints <= 0) return

    const provider = await getProvider()
    const signer = await getSigner(provider)
    if (!ethers?.Contract) {
      throw new Error('ethers.Contract is not available')
    }
    const contract = new ethers.Contract(
      TRAVELFI_TOKEN_ADDRESS,
      TRAVELFI_TOKEN_ABI,
      signer
    )

    try {
      if (!contract?.transfer) {
        throw new Error('Contract or transfer method not available')
      }
      const tx = await contract.transfer(
        walletAddress,
        ethers.parseEther(userPoints.toString())
      )
      await tx.wait()

      await prisma.user.update({
        where: { id: userId },
        data: {
          points: 0,
          walletAddress
        }
      })
    } catch (error) {
      console.error('Failed to convert points to tokens:', error)
      throw new Error('Token conversion failed')
    }
  }
}

export const rewardService = RewardService.getInstance()