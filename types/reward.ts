import { PrismaClient, Contribution, TokenTransaction } from '@prisma/client'

export interface RewardResult {
  points: number
  tokens: number
}

export interface WeeklyLimits {
  points: number
  tokens: number
}

export type RewardType = 'add_wifi' | 'security_report' | 'add_review' | 'add_esim'

export interface TokenTransfer {
  userId: number
  amount: string
  status: 'pending' | 'completed' | 'failed'
  txHash?: string
}

// Расширяем интерфейс PrismaClient для типизации транзакций
declare module '@prisma/client' {
  interface PrismaClient {
    tokenTransaction: {
      create: (data: { data: TokenTransfer }) => Promise<TokenTransaction>
      findMany: (args: any) => Promise<TokenTransaction[]>
    }
  }
}